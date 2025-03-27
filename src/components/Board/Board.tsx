import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
// import { CanvasContextType } from "../../types/types";
import rough from "roughjs";
import "./board.css";
import { MENU_BTN_UTILS } from "../../utils";
import { actionBtnClick } from "../../store/slice/menuSlice";
import { socket } from "../../utils/socket";
import { Drawable } from "roughjs/bin/core";

type ConfigType = {
  colour: string;
  size: number;
};

type CordsType = {
  x: number;
  y: number;
};

type EventType = React.MouseEvent<HTMLCanvasElement>;

type ElementType = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  roughJsx?: Drawable;
};

const generator = rough.generator();

const createElement = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): ElementType => {
  const roughJsx = generator.line(x1, y1, x2, y2);
  return { x1, y1, x2, y2, roughJsx };
};

const Board = () => {
  const [elements, setElements] = useState<ElementType[]>([]);
  const dispatch = useAppDispatch();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const Drawable = useRef<boolean>(false);

  const historyArray = useRef<(ImageData | undefined)[]>([]);

  const historyPointer = useRef<number>(0);

  // const currentXYPenPoint = useRef<PenPointTypes>({ x: 0, y: 0 });

  const { activeMenuBtn, actionMenuBtn } = useAppSelector(
    (state) => state.menu
  );

  const { color, size } = useAppSelector(
    (state) => state.toolbox[activeMenuBtn]
  );

  const activeMenuBtnRef = useRef(activeMenuBtn);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    // const context = canvas.getContext("2d");

    if (!activeMenuBtn) return;
    activeMenuBtnRef.current = activeMenuBtn;

    if (actionMenuBtn === MENU_BTN_UTILS.DOWNLOAD) {
      const Url = canvas.toDataURL();
      const anchor = document.createElement("a");
      anchor.href = Url;
      anchor.download = "sketch.png";
      anchor.click();
      console.log(Url);
    }
    // console.log("active2", activeMenuBtn);

    dispatch(actionBtnClick(null));
  }, [actionMenuBtn, activeMenuBtn, dispatch]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // to check for undefined and set an abitrary value that is obviously out of range of the values,
    // in color and size -for debug friendly situations
    if (!context) return;
    const UpdateConfig = (color?: string, size?: number) => {
      context.strokeStyle = color ?? "red";
      context.lineWidth = size ?? 10;
    };

    const handleConfigUpdate = (config: ConfigType) => {
      console.log("config--", config);

      UpdateConfig(config.colour, config.size);
    };

    UpdateConfig(color, size);

    socket.on("updateConfig", handleConfigUpdate);

    return () => {
      socket.off("updateConfig", handleConfigUpdate);
    };
  }, [color, size]);

  //bafore browser paint

  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const context = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //*****roughjs initialization *****//
    const roughCanvas = rough.canvas(canvas);

    // const line = generator.line(10, 10, 110, 110);
    // roughCanvas.draw(line);

    const beginPath = (x: number, y: number) => {
      context?.beginPath();
      context?.moveTo(x, y);
    };

    const drawStroke = (x: number, y: number) => {
      context?.lineTo(x, y);
      context?.stroke();
    };

    const drawRect = (e: EventType) => {
      const element = createElement(e.clientX, e.clientY, e.clientX, e.clientY);

      setElements((prev: any[]) => [...prev, element]);
    };

    // const rect = generator.rectangle(10, 10, 100, 100);

    // roughCanvas.draw(rect);

    const UpdateRectValue = ({ clientX, clientY }: EventType) => {
      const { x1, y1 } = elements[elements.length - 1];
      const updatedElement = createElement(x1, y1, clientX, clientY);

      const copyElements = [...elements];

      copyElements[elements.length - 1] = updatedElement;

      setElements(copyElements);

      elements.forEach(({ roughJsx }) => {
        if (!roughJsx) return;
        roughCanvas.draw(roughJsx);
        // context?.stroke();
      });
    };

    //mouse events

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      Drawable.current = true;

      beginPath(e.clientX, e.clientY);

      if (activeMenuBtnRef.current === MENU_BTN_UTILS.LINE) {
        drawRect(e);
      }
      socket.emit("beginPath", { x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!Drawable.current) return;
      drawStroke(e.clientX, e.clientY);

      if (activeMenuBtnRef.current === MENU_BTN_UTILS.LINE) {
        if (!Drawable.current) return;

        UpdateRectValue(e);
      }

      socket.emit("drawStroke", { x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
      Drawable.current = false;
      const imageData = context?.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      if (activeMenuBtnRef.current === MENU_BTN_UTILS.SQUARE) {
        context?.stroke();
      }

      historyArray.current.push(imageData);
      historyPointer.current = historyArray.current.length - 1;
    };

    const handleKeyPressCombo = (e: React.KeyboardEvent) => {
      if (e.code == "KeyZ" && (e.ctrlKey || e.metaKey)) {
        handleUndo();
      }

      if (e.code == "KeyY" && (e.metaKey || e.ctrlKey)) {
        handleRedo();
      }
    };

    const handleBeginpath = (cords: CordsType) => {
      beginPath(cords.x, cords.y);
    };

    const handleDrawStroke = (cords: CordsType) => {
      drawStroke(cords.x, cords.y);

      if (activeMenuBtnRef.current === MENU_BTN_UTILS.SQUARE) {
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keydown", handleKeyPressCombo);

    socket.on("beginPath", handleBeginpath);
    socket.on("drawStroke", handleDrawStroke);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keydown", handleKeyPressCombo);

      socket.off("beginPath", handleBeginpath);
      socket.off("drawStroke", handleDrawStroke);
    };
  }, [elements]);

  const handleUndo = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (historyPointer.current > 0) historyPointer.current -= 1;

    const imageData = historyArray.current[historyPointer.current];

    if (!imageData) return;
    context?.putImageData(imageData, 0, 0);
  };

  const handleRedo = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (historyPointer.current < historyArray.current.length - 1) {
      historyPointer.current += 1;
    }

    const imageData = historyArray.current[historyPointer.current]!;

    if (!imageData) return;
    context?.putImageData(imageData, 0, 0);
  };

  socket.on("connect", () => {
    console.log(socket.id, "client connected succesfully");
  });

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef} id="canvas">
        Drawing canvas
      </canvas>
      <div onClick={() => handleUndo()}>undo</div>
    </div>
  );
};

export default memo(Board);
