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
  // id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  roughJsx?: Drawable;
  type?: string;
};

type CicleElementType = {
  cx: number;
  cy: number;
  diameter: number;
  roughJsx?: Drawable;
  cx2?: number;
};

type ContextType = CanvasRenderingContext2D & { isContextLost: () => boolean };

const generator = rough.generator();

// const createElement = (
//   x1: number,
//   y1: number,
//   x2: number,
//   y2: number,
//   type:string

// ): ElementType => {
//   const roughJsx = generator.line(x1, y1, x2, y2);
//   return { x1, y1, x2, y2, roughJsx };
// };

const createElement = (
  // id: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  type: string
) => {
  let roughJsx;
  //   type === MENU_BTN_UTILS.LINE
  //     ? generator.line(x1, y1, x2, y2)
  //     : generator.rectangle(x1, y1, x2 - x1, y2 - y1);
  // if (type === MENU_BTN_UTILS.CIRCLE) {
  //  const roughJsx = generator.ellipse(x1, y1, x2, y2);
  // }

  switch (type) {
    case MENU_BTN_UTILS.LINE:
      roughJsx = generator.line(x1, y1, x2, y2);
      break;

    case MENU_BTN_UTILS.SQUARE:
      roughJsx = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
      break;

    case MENU_BTN_UTILS.CIRCLE:
      roughJsx = generator.ellipse(x1, y1, x2 - x1, y2 - y1);
      break;

    default:
      break;
  }
  if (roughJsx) return { x1, y1, x2, y2, type, roughJsx };
};

const createCircleElement = (cx: number, cy: number, diameter: number) => {
  const roughJsx = generator.circle(cx, cy, diameter);
  return { cx, cy, diameter, roughJsx };
};

const isWithinElement = (x, y, elements) => {
  const { type, x1, x2, y1, y2 } = elements;
  if (type === "SQUARE") {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  } else {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y };

    const offSet: number = distance(a, b) - (distance(a, c) + distance(b, c));

    return Math.abs(offSet) < 1;
  }
};

function distance(a: any, b: any) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

const getElementAtPosition = (x: any, y: any, elements: any) => {
  return elements.find((element: any) => isWithinElement(x, y, element));
};

const Board = () => {
  const [elements, setElements] = useState<ElementType[]>([]);
  const [action, setAction] = useState("none");
  const [selectedElement, setSelectedElement] = useState(null);
  const [elementsCircle, setCircleElements] = useState<CicleElementType[]>([]);
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
      const element = createElement(
        e.clientX,
        e.clientY,
        e.clientX,
        e.clientY,
        MENU_BTN_UTILS.SQUARE
      );

      setElements((prev: any[]) => [...prev, element]);
    };

    const drawLine = (e: EventType) => {
      const element = createElement(
        e.clientX,
        e.clientY,
        e.clientX,
        e.clientY,
        MENU_BTN_UTILS.LINE
      );

      setElements((prev: any[]) => [...prev, element]);
      console.log("elements", elements);
    };

    const drawCicle = (e: EventType) => {
      const element = createElement(
        e.clientX,
        e.clientY,
        e.clientX,
        e.clientY,
        MENU_BTN_UTILS.CIRCLE
      );

      setElements((prev: any[]) => [...prev, element]);

      // setCircleElements((prev: any[]) => [...prev, element]);
      console.log("elementsCircle", elements);
    };

    // const rect = generator.rectangle(10, 10, 100, 100);
    const rc = generator.ellipse(200, 200, 50, 50);

    roughCanvas.draw(rc);

    const UpdateRoughValue = ({ clientX, clientY }: EventType) => {
      const { x1, y1 } = elements[elements.length - 1];
      let updatedElement = null;
      switch (activeMenuBtnRef.current) {
        case MENU_BTN_UTILS.LINE:
          updatedElement = createElement(
            x1,
            y1,
            clientX,
            clientY,
            MENU_BTN_UTILS.LINE
          );

          break;

        case MENU_BTN_UTILS.SQUARE:
          updatedElement = createElement(
            x1,
            y1,
            clientX,
            clientY,
            MENU_BTN_UTILS.SQUARE
          );

          break;

        case MENU_BTN_UTILS.CIRCLE:
          updatedElement = createElement(
            x1,
            y1,
            clientX,
            clientY,
            MENU_BTN_UTILS.CIRCLE
          );

          break;

        default:
          break;
      }

      const copyElements = [...elements];

      if (!updatedElement) return;

      copyElements[elements.length - 1] = updatedElement;

      setElements(copyElements);
    };

    // const UpdateCircleValue = (e: EventType) => {
    //   const { x1, y1 } = elements[elements.length - 1];

    //   let updatedElement = createElement(
    //     x1,
    //     y1,
    //     e.clientX,
    //     e.clientY,
    //     MENU_BTN_UTILS.CIRCLE
    //   );

    //   const copyElements = [...elements];

    //   copyElements[elements.length - 1] = updatedElement;

    //   setElements(copyElements);
    // };

    // const handleSelection = () => {
    //   const element = getElementAtPosition(clientX, clientY, elements);
    // };

    //mouse events

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      Drawable.current = true;

      // beginPath(e.clientX, e.clientY);

      switch (activeMenuBtnRef.current) {
        case MENU_BTN_UTILS.LINE:
          Drawable.current = true;
          drawLine(e);

          break;

        case MENU_BTN_UTILS.SQUARE:
          Drawable.current = true;
          drawRect(e);

          break;

        case MENU_BTN_UTILS.CIRCLE:
          Drawable.current = true;
          drawCicle(e);
          break;

        case MENU_BTN_UTILS.SELECTION:
          Drawable.current = false;
          const element = getElementAtPosition(e.clientX, e.clientY, elements);

          if (element) {
            setSelectedElement(element);
            setAction("moving");
          }
          break;

        default:
          beginPath(e.clientX, e.clientY);

          break;
      }

      socket.emit("beginPath", { x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!Drawable.current) return;
      drawStroke(e.clientX, e.clientY);

      // if (action === "drawing") {
      switch (activeMenuBtnRef.current) {
        case MENU_BTN_UTILS.LINE:
          if (!Drawable.current) return;

          UpdateRoughValue(e);
          break;

        case MENU_BTN_UTILS.SQUARE:
          if (!Drawable.current) return;

          UpdateRoughValue(e);
          break;

        case MENU_BTN_UTILS.CIRCLE:
          if (!Drawable.current) return;

          UpdateRoughValue(e);
          break;

        default:
          break;
      }
      // } else if (action === "moving") {
      //   const {} = selectedElement;
      // }

      socket.emit("drawStroke", { x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
      Drawable.current = false;
      setAction("none");
      setSelectedElement(null);

      const imageData = context?.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

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
    };

    elements.forEach(({ roughJsx }) => {
      if (!roughJsx) return;
      roughCanvas.draw(roughJsx);
    });

    // elementsCircle.forEach(({ roughJsx }) => {
    //   if (!roughJsx) return;
    //   roughCanvas.draw(roughJsx);
    // });

    // const circle = generator.circle(500, 50, 120);

    // roughCanvas.draw(circle);

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
