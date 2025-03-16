import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import { router } from "./routes/index.tsx";
import { RouterProvider } from "react-router";

// import App from "./App.tsx";
import store from "./store/index.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <AuthProvider> */}
    {/* <ToastProvider> */}
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
    {/* <App /> */}

    {/* </ToastProvider> */}
    {/* </AuthProvider> */}
  </StrictMode>
);
