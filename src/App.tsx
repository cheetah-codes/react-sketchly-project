import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Menu from "./components/Menu";
import ToolBox from "./components/Toolbox/ToolBox";

function App() {
  // const [count, setCount] = useState(0);

  return (
    <>
      {/* <h1 className="text-primary">sketchly</h1> */}
      <Menu />
      <ToolBox />
    </>
  );
}

export default App;
