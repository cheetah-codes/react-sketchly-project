import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
// import { CanvasContextType } from "../../types/types";
import rough from "roughjs";
import "./board.css";
import { MENU_BTN_UTILS } from "../../utils";
import { actionBtnClick } from "../../store/slice/menuSlice";
import { socket } from "../../utils/socket";
import { Drawable } from "roughjs/bin/core";
import { height } from "@fortawesome/free-solid-svg-icons/faBell";

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
  type?: string;
  id?: number;
};

type ActionType = "moving" | "drawing" | "none";

type ContextType = CanvasRenderingContext2D & { isContextLost: () => boolean };

const generator = rough.generator();

const createElement = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  type: string,
  id?: number
): ElementType => {
  let roughJsx;

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
  return { x1, y1, x2, y2, type, roughJsx, id };
};

const isWithinElement = (x: number, y: number, elements: ElementType) => {
  const { type, x1, x2, y1, y2 } = elements;
  if (type === "SQUARE" || type === "CIRCLE") {
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

const getElementAtPosition = (
  x: number,
  y: number,
  elements: ElementType[]
) => {
  return elements.find((element: any) => isWithinElement(x, y, element));
};

//////////////////////////////////////////////COMPONENT MAIN FUNCTION BODY//////////////////////////////////////////////////////////////////////////////////////////////////////

const Board = () => {
  const [elements, setElements] = useState<ElementType[]>([]);

  // const action = useRef<ActionType>("none");

  const [action, setAction] = useState<ActionType>("none");

  // const selectedElement = useRef<ElementType | null>(null);
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(
    null!
  );

  const idRef = useRef<number>(elements.length);

  const dispatch = useAppDispatch();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const context = canvasRef.current?.getContext("2d");

  const Drawable = useRef<boolean>(false);

  const historyArray = useRef<(ImageData | undefined)[]>([]);

  const historyPointer = useRef<number>(0);

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
    // context?.clearRect(0, 0, canvas.width, canvas.height);

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

    // const drawRect = (e: EventType, id: number) => {
    //   const element = createElement(
    //     e.clientX,
    //     e.clientY,
    //     e.clientX,
    //     e.clientY,
    //     MENU_BTN_UTILS.SQUARE,
    //     id
    //   );

    //   setElements((prev: any[]) => [...prev, element]);
    // };

    // const drawLine = (e: EventType, id: number) => {
    //   const element = createElement(
    //     e.clientX,
    //     e.clientY,
    //     e.clientX,
    //     e.clientY,
    //     MENU_BTN_UTILS.LINE,
    //     id
    //   );

    //   setElements((prev: any[]) => [...prev, element]);
    // };

    // const drawCicle = (e: EventType, id: number) => {
    //   const element = createElement(
    //     e.clientX,
    //     e.clientY,
    //     e.clientX,
    //     e.clientY,
    //     MENU_BTN_UTILS.CIRCLE,
    //     id
    //   );

    //   setElements((prev: any[]) => [...prev, element]);
    // };

    // const rect = generator.rectangle(10, 10, 100, 100);
    // const rc = generator.ellipse(200, 200, 50, 50);

    // roughCanvas.draw(rc);

    const UpdateRoughValue = ({ clientX, clientY }: EventType, id: number) => {
      const { x1, y1 } = elements[id];
      let updatedElement = null;
      switch (activeMenuBtnRef.current) {
        case MENU_BTN_UTILS.LINE:
          updatedElement = createElement(
            x1,
            y1,
            clientX,
            clientY,
            MENU_BTN_UTILS.LINE,
            id
          );

          break;

        case MENU_BTN_UTILS.SQUARE:
          updatedElement = createElement(
            x1,
            y1,
            clientX,
            clientY,
            MENU_BTN_UTILS.SQUARE,
            id
          );

          break;

        case MENU_BTN_UTILS.CIRCLE:
          updatedElement = createElement(
            x1,
            y1,
            clientX,
            clientY,
            MENU_BTN_UTILS.CIRCLE,
            id
          );

          break;

        default:
          break;
      }

      const copyElements = [...elements];

      if (!updatedElement) return;

      copyElements[id] = updatedElement;

      setElements(copyElements);
    };

    const updateElement = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      type: string,
      id: number
    ) => {
      const updatedElement = createElement(x1, y1, x2, y2, type, id);
      const copyElements = [...elements];

      // if (!updatedElement) return;
      copyElements[id] = updatedElement;

      setElements(copyElements);
    };

    const moveElement = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      type: string,
      id: number
    ) => {
      const updatedElement = createElement(x1, y1, x2, y2, type, id);
      const copyElements = [...elements];

      // if (!updatedElement) return;
      copyElements[elements.length] = updatedElement;

      setElements(copyElements);
    };
    //mouse events

    ////////////////////////////////////////////MOUSE DOWN /////////////////////////////////////////////////////////////////////////////////////////////////////

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      Drawable.current = true;

      beginPath(e.clientX, e.clientY);
      // action.current = "none";

      if (activeMenuBtnRef.current === MENU_BTN_UTILS.SELECTION) {
        const element = getElementAtPosition(e.clientX, e.clientY, elements);

        if (element) {
          // selectedElement.current = element;
          setSelectedElement(element);
          setAction("moving");
        }
      } else {
        // action.current = "none";
        const id = elements.length;

        const element = createElement(
          e.clientX,
          e.clientY,
          e.clientX,
          e.clientY,
          activeMenuBtnRef.current,
          id
        );
        setElements((prev) => [...prev, element]);
        setAction("drawing");
      }

      // switch (activeMenuBtnRef.current) {
      //   case MENU_BTN_UTILS.LINE:
      //     Drawable.current = true;
      //     // action.current = "drawing";
      //     setAction("drawing");
      //     drawLine(e, id);

      //     break;

      //   case MENU_BTN_UTILS.SQUARE:
      //     Drawable.current = true;
      //     // action.current = "drawing";
      //     setAction("drawing");

      //     drawRect(e, id);

      //     break;

      //   case MENU_BTN_UTILS.CIRCLE:
      //     Drawable.current = true;
      //     // action.current = "drawing";
      //     setAction("drawing");

      //     drawCicle(e, id);
      //     break;

      //   case MENU_BTN_UTILS.SELECTION:
      //     Drawable.current = false;
      //     const element = getElementAtPosition(e.clientX, e.clientY, elements);
      //     console.log(
      //       element,
      //       elements,
      //       "elements.lenght=",
      //       elements.length,
      //       id
      //     );

      //     if (element) {
      //       selectedElement.current = element;

      //       // action.current = "moving";
      //       setAction("moving");
      //       console.log("selectedele", selectedElement.current, id);
      //     } else {
      //       // action.current = "none";
      //       const id = elements.length;
      //       const element = createElement(
      //         e.clientX,
      //         e.clientY,
      //         e.clientX,
      //         e.clientY,
      //         activeMenuBtnRef.current,
      //         id
      //       );
      //       setElements((prev) => [...prev, element]);
      //       setAction("none");
      //     }
      //     break;

      //   default:
      //     // action.current = "drawing";
      //     // setAction("drawing")

      //     break;
      // }

      socket.emit("beginPath", { x: e.clientX, y: e.clientY });
    };

    ////////////////////////////////////////////MOUSE MOVE /////////////////////////////////////////////////////////////////////////////////////////////////////

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!Drawable.current) return;

      // drawStroke(e.clientX, e.clientY);

      if (action === "drawing") {
        // switch (activeMenuBtnRef.current) {
        //   case MENU_BTN_UTILS.LINE:
        //     if (!Drawable.current) return;
        //     UpdateRoughValue(e, index);
        //     break;
        //   case MENU_BTN_UTILS.SQUARE:
        //     if (!Drawable.current) return;
        //     UpdateRoughValue(e, index);
        //     break;
        //   case MENU_BTN_UTILS.CIRCLE:
        //     if (!Drawable.current) return;
        //     UpdateRoughValue(e, index);
        //     break;
        //   default:
        //     break;
        // }

        const index = elements.length - 1;

        const { x1, y1 } = elements[index];
        updateElement(
          x1,
          y1,
          e.clientX,
          e.clientY,
          activeMenuBtnRef.current,
          index
        );
        // const updatedElement = createElement(
        //   x1,
        //   y1,
        //   e.clientX,
        //   e.clientY,
        //   activeMenuBtnRef.current,
        //   index
        // );

        // const copyElements = [...elements];

        // copyElements[index] = updatedElement;
        // setElements(copyElements);
      } else if (action === "moving") {
        if (!selectedElement) return;

        const isd = elements.length;
        console.log(elements, isd, idRef.current, "---i fucking ddd");

        const { x1, x2, y1, y2, type, id } = selectedElement;

        console.log(
          selectedElement,
          id,
          idRef.current,
          action,
          "how the fck is this undefined"
        );

        const width = x2 - x1;
        const height = y2 - y1;

        if (!id) return;
        moveElement(
          e.clientX,
          e.clientY,
          e.clientX + width,
          e.clientY + height,
          activeMenuBtnRef.current,
          isd
        );

        // const copyElements = [...elements];

        // copyElements[id] = updatedElement;
        // setElements(copyElements);
      }

      socket.emit("drawStroke", { x: e.clientX, y: e.clientY });
    };

    ////////////////////////////////////////////MOUSE UP /////////////////////////////////////////////////////////////////////////////////////////////////////

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
      Drawable.current = false;

      // action.current = "none";
      // setAction("none");

      // setSelectedElement(null);

      // const imageData = context?.getImageData(
      //   0,
      //   0,
      //   canvas.width,
      //   canvas.height
      // );

      // historyArray.current.push(imageData);
      // historyPointer.current = historyArray.current.length - 1;
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
  }, [elements, selectedElement]);

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
      <div>undo</div>
    </div>
  );
};

export default Board;
