import { createSlice } from "@reduxjs/toolkit";
import { MENU_BTN_UTILS } from "../../utils";

// type InitailState = {
//   key: string;
// };

const initialState = {
  activeMenuBtn: MENU_BTN_UTILS.PENCIL,
  actionMenuBtn: null,
};

export const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    activebtnClick: (state, action) => {
      state.activeMenuBtn = action?.payload;
    },
    actionBtnClick: (state, action) => {
      state.actionMenuBtn = action?.payload;
    },
  },
});

export default menuSlice.reducer;
export const { activebtnClick, actionBtnClick } = menuSlice.actions;
