import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
// import { CanvasContextType } from "../../types/types";

type ImageDataType = Uint8ClampedArray | undefined;

import "./board.css";
import { MENU_BTN_UTILS } from "../../utils";
import { actionBtnClick } from "../../store/slice/menuSlice";

const Board = () => {
  const dispatch = useAppDispatch();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const Drawable = useRef<boolean>(false);

  const [historyArray, setHistoryArray] = useState<
    (Uint8ClampedArray | undefined)[]
  >([]);

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

    console.log(context?.stroke, "this context");

    // to check for undefined and set an abitrary value that is obviously out of range of the values,
    // in color and size -for debug friendly situations
    if (!context) return;
    const UpdateConfig = () => {
      context.strokeStyle = color ?? "red";
      context.lineWidth = size ?? 10;
    };

    UpdateConfig();
  }, [color, size]);

  //on mount

  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      Drawable.current = true;

      context?.beginPath();
      context?.moveTo(e.clientX, e.clientY);
      // context?.fillRect(
      //   e.clientX,
      //   e.clientY,
      //   currentXYPenPoint.current.x,
      //   currentXYPenPoint.current.y
      // );
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!Drawable.current) return;
      context?.lineTo(e.clientX, e.clientY);
      context?.stroke();
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
      Drawable.current = false;
      const imageData = context?.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );
      console.log(imageData, "image adata");
      setHistoryArray([...historyArray, imageData?.data]);
      historyPointer.current = historyArray.length - 1;
    };

    const handleKeyPressCombo = (e: React.KeyboardEvent) => {
      if (e.code == "KeyZ" && (e.ctrlKey || e.metaKey)) {
        // console.log("hey you pressed for undo");
        handleUndo();
      }

      if (e.code == "KeyY" && (e.metaKey || e.ctrlKey)) {
        handleUndo();
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keydown", handleKeyPressCombo);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keydown", handleKeyPressCombo);
    };
  }, []);

  const handleUndo = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (historyPointer.current > 0) historyPointer.current -= 1;

    const imageData = historyArray[historyPointer.current];

    context?.putImageData(imageData, 0, 0);

    alert("undo");
  };

  const handleRedo = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (historyPointer.current < historyArray.length - 1) {
      historyPointer.current += 1;
    }

    const imageData = historyArray[historyPointer.current];

    context?.putImageData(imageData, 0, 0);
  };

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef}>Drawing canvas</canvas>
      <div onClick={() => handleUndo()}>undo</div>
    </div>
  );
};

export default Board;
