import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  faPencil,
  faEraser,
  faRotateRight,
  faRotateLeft,
  faFileArrowDown,
  faHand,
  faArrowPointer,
  faDownload,
  faBox,
  faSquare,
  faCircle,
  faMinus,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { MENU_BTN_UTILS } from "../../utils";
import "./index.css";
import { activebtnClick, actionBtnClick } from "../../store/slice/menuSlice";

const Menu = () => {
  const dispatch = useAppDispatch();
  const { activeMenuBtn } = useAppSelector((state) => state.menu);

  const handleMenuClick = (utils: any) => {
    dispatch(activebtnClick(utils));
  };

  const handleActionBtnClick = (utils: any) => {
    dispatch(actionBtnClick(utils));
  };

  return (
    <div className="menuContainer">
      <div
        className={`${
          activeMenuBtn === MENU_BTN_UTILS.PAN ? "active" : ""
        } iconwrapper`}
        onClick={() => handleMenuClick(MENU_BTN_UTILS.PAN)}
      >
        <FontAwesomeIcon icon={faHand} />
      </div>

      <div
        className={`${
          activeMenuBtn === MENU_BTN_UTILS.SELECTION ? "active" : ""
        } iconwrapper`}
        onClick={() => handleMenuClick(MENU_BTN_UTILS.SELECTION)}
      >
        <FontAwesomeIcon icon={faArrowPointer} />
      </div>

      <div
        className={`${
          activeMenuBtn === MENU_BTN_UTILS.PENCIL ? "active" : ""
        } iconwrapper`}
        onClick={() => handleMenuClick(MENU_BTN_UTILS.PENCIL)}
      >
        <FontAwesomeIcon icon={faPencil} />
      </div>

      <div
        className={`${
          activeMenuBtn === MENU_BTN_UTILS.ERASER ? "active" : ""
        } iconwrapper`}
        onClick={() => handleMenuClick(MENU_BTN_UTILS.ERASER)}
      >
        <FontAwesomeIcon icon={faEraser} />
      </div>

      <div
        className={`${
          activeMenuBtn === MENU_BTN_UTILS.SQUARE ? "active" : ""
        } iconwrapper`}
        onClick={() => handleMenuClick(MENU_BTN_UTILS.SQUARE)}
      >
        <FontAwesomeIcon icon={faSquare} />
      </div>

      <div
        className={`${
          activeMenuBtn === MENU_BTN_UTILS.LINE ? "active" : ""
        } iconwrapper`}
        onClick={() => handleMenuClick(MENU_BTN_UTILS.LINE)}
      >
        <FontAwesomeIcon icon={faMinus} size="xl" />
      </div>

      <div
        className={`${
          activeMenuBtn === MENU_BTN_UTILS.CIRCLE ? "active" : ""
        } iconwrapper`}
        onClick={() => handleMenuClick(MENU_BTN_UTILS.CIRCLE)}
      >
        <FontAwesomeIcon icon={faCircle} />
      </div>

      <div
        className={`${
          activeMenuBtn === MENU_BTN_UTILS.ARROW ? "active" : ""
        } iconwrapper`}
        onClick={() => handleMenuClick(MENU_BTN_UTILS.ARROW)}
      >
        <FontAwesomeIcon icon={faArrowRight} />
      </div>

      <div className="iconwrapper">
        <FontAwesomeIcon
          icon={faDownload}
          onClick={() => handleActionBtnClick(MENU_BTN_UTILS.DOWNLOAD)}
        />
      </div>

      {/* <div className="iconwrapper">
        <FontAwesomeIcon icon={faFileArrowDown} />
      </div>


      <div className="iconwrapper">
        <FontAwesomeIcon icon={faFileArrowDown} />
      </div> */}
    </div>
  );
};

export default Menu;

{
  /* <div className="iconwrapper">
        <FontAwesomeIcon icon={faRotateLeft} />
      </div>

      <div className="iconwrapper">
        <FontAwesomeIcon icon={faRotateRight} />
      </div> */
}
