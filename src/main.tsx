import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { router } from "./routes/index.tsx";
import { RouterProvider } from "react-router";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <AuthProvider> */}
    {/* <ToastProvider> */}
    {/* <RouterProvider router={router} /> */}
    <App />
    {/* </ToastProvider> */}
    {/* </AuthProvider> */}
  </StrictMode>
);
