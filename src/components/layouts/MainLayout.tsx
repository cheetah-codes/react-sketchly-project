import { Outlet } from "react-router";
// import MainNavbar from "../navbar/MainNavbar";
// import SideBar from "../navbar/SideBar";

const MainLayout = () => {
  return (
    <>
      <main>
        {/* <MainNavbar /> */}
        {/* <SideBar /> */}

        <Outlet />
      </main>
    </>
  );
};

export default MainLayout;
