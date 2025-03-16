import { createBrowserRouter, Navigate } from "react-router";
import AuthLayout from "../components/layouts/AuthLayout";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
// import { useContext } from "react";
// import { AuthContext } from "../contexts/AuthContext";
import Home from "../pages/app/Home";
import MainLayout from "../components/layouts/MainLayout";
import App from "../App";
// const auth = useContext(AuthContext);

export const router = createBrowserRouter([
  // {
  //   path: "",
  //   element: <AuthLayout />,
  //   children: [
  //     // {
  //     //   index: true,
  //     //   path: "",
  //     //   element: <Navigate to={"login"} />,
  //     // },

  //     {
  //       path: "/signup",
  //       element: <Signup />,
  //     },
  //     {
  //       path: "/login",
  //       element: <Login />,
  //     },
  //   ],
  // },

  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "workspace",
        index: true,
        element: <Home />,
      },
    ],
  },

  {
    path: "*",
    element: <div>not found</div>,
  },
  // },
  // {
  //   index: true,
  //   element: <Da />,
  // },
  // {
  //   path: "/test",
  //   element: <FriendList />,
  // },
  // { path: "*", element: <NotFound /> },
]);

//if not authenticated redirect to login route else allow them to stay - mainlayout--check from local storage and context -(of which the initial state of the context is the query of the localStorage)
//if user is authenthecated,allow them to stay else redirect  them to the mainlayout (home)
