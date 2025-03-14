import { Outlet } from "react-router";
import "../../styles/globals.scss";
import MainNavbar from "../navbar/MainNavbar";
import SideBar from "../navbar/SideBar";

const MainLayout = () => {
  return (
    <>
      <main>
        <MainNavbar />
        <SideBar />
        <div className="flex">
          <Outlet />
        </div>
      </main>
    </>
  );
};

export default MainLayout;
