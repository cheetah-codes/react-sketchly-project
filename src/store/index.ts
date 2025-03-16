import { configureStore } from "@reduxjs/toolkit";
import MenuReducer from "./slice/menuSlice";
import ToolBoxReducer from "./slice/toolboxSlice";

const store = configureStore({
  reducer: {
    menu: MenuReducer,
    toolbox: ToolBoxReducer,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
