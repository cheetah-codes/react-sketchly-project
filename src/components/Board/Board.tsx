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
  type?: string;
  id?: number;
};

type SelectedElementType = {
  element: ElementType;
  offsetX?: number;
  offsetY?: number;
  // position?: string;
};

type ActionType = "moving" | "drawing" | "none" | "resize";

type ContextType = CanvasRenderingContext2D & { isContextLost: () => boolean };

const generator = rough.generator();

const createElement = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  type: string,
  id: number
): ElementType => {
  let roughJsx;
  let storedjsx;

  //  roughJsx =
  //   type === MENU_BTN_UTILS.LINE
  //     ? generator.line(x1, y1, x2, y2)
  //     : generator.rectangle(x1, y1, x2 - x1, y2 - y1);

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

    case MENU_BTN_UTILS.SELECTION:
      roughJsx = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
      break;

    default:
      throw new Error(`type not found:${type}`);
      break;
  }
  return { x1, y1, x2, y2, type, roughJsx, id };
};

const nearPoint = (
  x: number,
  y: number,
  x1: number,
  y1: number,
  identifier: string
) => {
  return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? identifier : null;
};

const PositionisWithinElement = (
  x: number,
  y: number,
  elements: ElementType
) => {
  const { type, x1, x2, y1, y2 } = elements;
  if (type === "SQUARE" || type === "CIRCLE") {
    const topLeft = nearPoint(x, y, x1, y1, "tl");
    const topRight = nearPoint(x, y, x2, y1, "tr");
    const bottomLeft = nearPoint(x, y, x1, y2, "bl");
    const bottomRight = nearPoint(x, y, x2, y2, "br");
    const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
    return topLeft || topRight || bottomLeft || bottomRight || inside;
  } else {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y };

    const offSet: number = distance(a, b) - (distance(a, c) + distance(b, c));

    const start = nearPoint(x, y, x1, y1, "start");

    const end = nearPoint(x, y, x2, y2, "end");

    const inside = Math.abs(offSet) < 1 ? "inside" : null;

    return start || end || inside;
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
  return elements
    .map((element) => ({
      ...element,
      position: PositionisWithinElement(x, y, element),
    }))
    .find((element) => element.position !== null);
};

const adjustElementCoords = (element: ElementType) => {
  const { type, x1, y1, x2, y2 } = element;

  console.log(type, x1, y1, x2, y2, "from adjuestElementCoords");

  switch (type) {
    case MENU_BTN_UTILS.LINE:
      if (x1 < x2 || (x1 === x2 && y1 < y2)) {
        return { x1, y1, x2, y2 };
      } else {
        return { x1: x2, y1: y2, x2: x1, y2: y1 };
      }
      break;

    case MENU_BTN_UTILS.SQUARE || MENU_BTN_UTILS.CIRCLE:
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);

      return { x1: minX, y1: minY, x2: maxX, y2: maxY };
      break;

    default:
      break;
  }
};

const cursorForPosition = (position: string) => {
  switch (position) {
    case "tl":
    case "br":
    case "start":
    case "end":
      return "nwse-resize";
    case "tr":
    case "bl":
      return "nesw-resize";
    default:
      return "move";
  }
};

const resizeElementCoords = (
  clientX: number,
  clientY: number,
  position: string,
  coordinates: any
) => {
  const { x1, y1, x2, y2 } = coordinates;
  switch (position) {
    case "tl":
    case "start":
      return { x1: clientX, y1: clientY, x2, y2 };
    case "tr":
      return { x1, y1: clientY, x2: clientX, y2 };
    case "bl":
      return { x1: clientX, y1, x2, y2: clientY };
    case "br":
    case "end":
      return { x1, y1, x2: clientX, y2: clientY };
    default:
      return null; //should not really get here...
  }
};

//////////////////////////////////////////////COMPONENT MAIN FUNCTION BODY//////////////////////////////////////////////////////////////////////////////////////////////////////

const Board = () => {
  const [elements, setElements] = useState<ElementType[]>([]);

  // const action = useRef<ActionType>("none");

  const [action, setAction] = useState<ActionType>("none");

  // const selectedElement = useRef<SelectedElementType | null>(null);
  const [selectedElement, setSelectedElement] = useState<SelectedElementType>(
    {} as SelectedElementType
  );

  const idRef = useRef<number>(0);

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

    copyElements[id] = updatedElement;

    setElements(copyElements);
  };

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

    //mouse events

    ////////////////////////////////////////////MOUSE DOWN /////////////////////////////////////////////////////////////////////////////////////////////////////

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      Drawable.current = true;

      beginPath(e.clientX, e.clientY);

      if (activeMenuBtnRef.current === MENU_BTN_UTILS.SELECTION) {
        const element = getElementAtPosition(e.clientX, e.clientY, elements);

        console.log("eleeeme", element);

        if (element) {
          const offsetX = e.clientX - element.x1;

          const offsetY = e.clientY - element.y1;

          setSelectedElement({ ...element, offsetX, offsetY });

          if (element.position === "inside") {
            setAction("moving");
          } else {
            setAction("resize");
          }
          // selectedElement.current = { ...element, offsetX, offsetY };
          // action.current = "moving";
        }
      } else {
        //drawing
        idRef.current = elements.length;

        console.log("elemnt on mousedown", elements[idRef.current]);

        const element = createElement(
          e.clientX,
          e.clientY,
          e.clientX,
          e.clientY,
          activeMenuBtnRef.current,
          idRef.current
        );

        setSelectedElement(element);

        setElements((prev) => [...prev, element]);

        setAction("drawing");
        // action.current = "drawing";
      }

      socket.emit("beginPath", { x: e.clientX, y: e.clientY });
    };

    ////////////////////////////////////////////MOUSE MOVE /////////////////////////////////////////////////////////////////////////////////////////////////////

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!Drawable.current) return;

      // drawStroke(e.clientX, e.clientY);
      if (activeMenuBtnRef.current === MENU_BTN_UTILS.SELECTION) {
        const target = e.target as HTMLCanvasElement;

        const element = getElementAtPosition(e.clientX, e.clientY, elements);
        if (!element?.position) return;
        target.style.cursor = element
          ? cursorForPosition(element.position)
          : "default";

        // target.style.cursor = getElementAtPosition(
        //   e.clientX,
        //   e.clientY,
        //   elements
        // )
        //   ? "move"
        //   : "default";
      }

      if (action === "drawing") {
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
      } else if (action === "moving") {
        console.log(selectedElement, "selele");

        if (!selectedElement) return;

        const { x1, y1, x2, y2, type, id, offsetX, offsetY } = selectedElement;

        console.log(
          selectedElement,
          id,
          idRef.current,
          action,
          type,
          "how the fck is this undefined"
        );

        if (!id || !offsetX || !offsetY) return;

        const width = x2 - x1;

        const height = y2 - y1;

        const newX = e.clientX - offsetX;

        const newY = e.clientY - offsetY;

        updateElement(
          newX,
          newY,
          newX + width,
          newY + height,
          activeMenuBtnRef.current,
          idRef.current
        );
      } else if (action === "resize") {
        // if (!selectedElement) return;

        const { id, type, position, ...cordinates } = selectedElement;

        const { x1, y1, x2, y2 } = resizeElementCoords(
          e.clientX,
          e.clientY,
          position,
          cordinates
        );

        if (!id || !type) return;

        updateElement(x1, y1, x2, y2, type, id);
      }

      socket.emit("drawStroke", { x: e.clientX, y: e.clientY });
    };

    ///////////////////////////////////////////////////////////////MOUSE UP /////////////////////////////////////////////////////////////////////////////////////////////////////

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const index = selectedElement?.id;

      if (!index) return;

      const { id, type } = elements[index];

      if (!type || !id) return;

      if (action == "drawing" || action === "resize") {
        const { x1, y1, x2, y2 } = adjustElementCoords(elements[index])!;

        updateElement(x1, y1, x2, y2, type, id);
      }
      // Drawable.current = false;

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
      console.log(elements, "element seperate");
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
      <div>undo {action}</div>
    </div>
  );
};

export default Board;
