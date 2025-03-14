// import { width } from "@fortawesome/free-solid-svg-icons/faBell";
import { COLORS_UTILS } from "../../utils";
import "./toolbox.css";
const ToolBox = () => {
  const handleBrushSize = () => {};
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
                    className="colorbox"
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
          <p className="tool-desc">Stroke width</p>
          <div className="prop-wrapper">
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              onChange={handleBrushSize}
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
