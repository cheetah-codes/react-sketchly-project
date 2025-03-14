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
      <div>
        <FontAwesomeIcon icon={faHand} />
      </div>

      <div>
        <FontAwesomeIcon icon={faArrowPointer} />
      </div>

      <div>
        <FontAwesomeIcon icon={faPencil} />
      </div>

      <div>
        <FontAwesomeIcon icon={faEraser} />
      </div>

      <div>
        <FontAwesomeIcon icon={faRotateLeft} />
      </div>

      <div>
        <FontAwesomeIcon icon={faRotateRight} />
      </div>

      <div>
        <FontAwesomeIcon icon={faFileArrowDown} />
      </div>
    </div>
  );
};

export default Menu;
