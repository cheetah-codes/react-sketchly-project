import { useEffect, useLayoutEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
// import { CanvasContextType } from "../../types/types";

import "./board.css";
import { MENU_BTN_UTILS } from "../../utils";
import { actionBtnClick } from "../../store/slice/menuSlice";
import { socket } from "../../utils/socket";

type ConfigType = {
  colour: string;
  size: number;
};

type CordsType = {
  x: number;
  y: number;
};

const Board = () => {
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

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    // const context = canvas.getContext("2d");

    if (actionMenuBtn === MENU_BTN_UTILS.DOWNLOAD) {
      const Url = canvas.toDataURL();
      const anchor = document.createElement("a");
      anchor.href = Url;
      anchor.download = "sketch.png";
      anchor.click();
      console.log(Url);
    }

    dispatch(actionBtnClick(null));
  }, [actionMenuBtn, dispatch]);

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

  //on mount

  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const beginPath = (x: number, y: number) => {
      context?.beginPath();
      context?.moveTo(x, y);
    };

    const drawStroke = (x: number, y: number) => {
      context?.lineTo(x, y);
      context?.stroke();
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      Drawable.current = true;
      beginPath(e.clientX, e.clientY);

      socket.emit("beginPath", { x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!Drawable.current) return;
      drawStroke(e.clientX, e.clientY);

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

      historyArray.current.push(imageData);
      historyPointer.current = historyArray.current.length - 1;
    };

    const handleKeyPressCombo = (e: React.KeyboardEvent) => {
      if (e.code == "KeyZ" && (e.ctrlKey || e.metaKey)) {
        // console.log("hey you pressed for undo");
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
  }, []);

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
      <canvas ref={canvasRef}>Drawing canvas</canvas>
      <div onClick={() => handleUndo()}>undo</div>
    </div>
  );
};

export default Board;
