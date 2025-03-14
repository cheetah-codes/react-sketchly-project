import { createContext, useContext } from "react";

type ToastContextValues = {
  open: (
    message: string,
    type: "error" | "alert" | "information" | "success"
  ) => void;
  close: (id: number) => void;
};

export const ToastContext = createContext<ToastContextValues | null>(null);

export const useToast = () => useContext(ToastContext);
