// import { width } from "@fortawesome/free-solid-svg-icons/faBell";
import { COLORS_UTILS } from "../../utils";
import "./toolbox.css";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { strokewidth, strokecolor } from "../../store/slice/toolboxSlice";
import { socket } from "../../utils/socket";

// const EventType = {
//   [e]:React.ChangeEvent<HTMLInputElement>
// }

const ToolBox = () => {
  const activeMenuBtn = useAppSelector((state) => state.menu.activeMenuBtn);

  const dispatch = useAppDispatch();
  const { color, size } = useAppSelector(
    (state) => state.toolbox[activeMenuBtn]
  );

  const handleBrushSize = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(strokewidth({ prop: activeMenuBtn, size: e.target.value }));
    socket.emit("updateConfig", { colour: color, size: e.target.value });
  };

  const handleStrokeColor = (newColour: string) => {
    dispatch(strokecolor({ prop: activeMenuBtn, color: newColour }));
    socket.emit("updateConfig", { colour: newColour, size });
  };
  return (
    <>
      <div className="toolbox-container">
        <div className="toolbox-sec-wrapper">
          <p className="tool-desc">Stroke color</p>
          <div className="prop-wrapper">
            <div>
              {Object.values(COLORS_UTILS).map((colors, id) => {
                return (
                  <div
                    className={`${color === colors ? "active" : ""} colorbox`}
                    onClick={() => handleStrokeColor(colors)}
                    key={id}
                    style={{
                      backgroundColor: colors,
                    }}
                  ></div>
                );
              })}
            </div>
          </div>
        </div>

        {/* brush sizes = stroke width*/}
        <div className="toolbox-sec-wrapper">
          <p className="tool-desc">Stroke width </p>
          <div className="prop-wrapper">
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              onChange={(e) => handleBrushSize(e)}
              value={size}
            />
          </div>
        </div>

        {/* stroke styles */}

        {/* <div className="toolbox-sec-wrapper">
          <p className="tool-desc">Stroke styles</p>
          <div className="prop-wrapper">
          
          </div>
        </div> */}
      </div>
    </>
  );
};

export default ToolBox;
