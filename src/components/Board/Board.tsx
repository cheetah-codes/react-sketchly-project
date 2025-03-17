import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
// import { CanvasContextType } from "../../types/types";

type PenPointTypes = {
  x: number;
  y: number;
};

import "./board.css";
import { MENU_BTN_UTILS } from "../../utils";
import { actionBtnClick } from "../../store/slice/menuSlice";

const Board = () => {
  const dispatch = useAppDispatch();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const Drawable = useRef<boolean>(false);
  const currentXYPenPoint = useRef<PenPointTypes>({ x: 0, y: 0 });

  const { activeMenuBtn, actionMenuBtn } = useAppSelector(
    (state) => state.menu
  );
  const { color, size } = useAppSelector(
    (state) => state.toolbox[activeMenuBtn]
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

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
      console.log(currentXYPenPoint.current);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef}>Drawing canvas</canvas>
    </div>
  );
};

export default Board;
