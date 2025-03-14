import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faEraser,
  faRotateRight,
  faRotateLeft,
  faFileArrowDown,
  faHand,
  faArrowPointer,
} from "@fortawesome/free-solid-svg-icons";
import "./index.css";

const Menu = () => {
  return (
    <div className="menuContainer">
      <div className="iconwrapper">
        <FontAwesomeIcon icon={faHand} />
      </div>

      <div className="iconwrapper">
        <FontAwesomeIcon icon={faArrowPointer} />
      </div>

      <div className="iconwrapper">
        <FontAwesomeIcon icon={faPencil} />
      </div>

      <div className="iconwrapper">
        <FontAwesomeIcon icon={faEraser} />
      </div>

      <div className="iconwrapper">
        <FontAwesomeIcon icon={faRotateLeft} />
      </div>

      <div className="iconwrapper">
        <FontAwesomeIcon icon={faRotateRight} />
      </div>

      <div className="iconwrapper">
        <FontAwesomeIcon icon={faFileArrowDown} />
      </div>
    </div>
  );
};

export default Menu;
