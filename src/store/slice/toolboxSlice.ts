import { createSlice } from "@reduxjs/toolkit";
import { COLORS_UTILS, MENU_BTN_UTILS } from "../../utils";

const initialState = {
  [MENU_BTN_UTILS.PENCIL]: {
    color: COLORS_UTILS.BLACK,
    size: 3,
  },
  [MENU_BTN_UTILS.ERASER]: {
    color: COLORS_UTILS.WHITE,
    size: 3,
  },
  [MENU_BTN_UTILS.DOWNLOAD]: {},
  [MENU_BTN_UTILS.SQUARE]: {
    color: "",
  },
};

export const toolBoxSlice = createSlice({
  name: "toolbox",
  initialState,
  reducers: {
    strokewidth: (state, action) => {
      state[action.payload.prop].size = action.payload?.size;
    },
    strokecolor: (state, action) => {
      state[action.payload?.prop].color = action.payload?.color;
    },
  },
});

export default toolBoxSlice.reducer;
export const { strokewidth, strokecolor } = toolBoxSlice.actions;
