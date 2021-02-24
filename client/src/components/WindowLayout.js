import React, { useState } from "react";
import Window from "./Window";
import "../styles/WindowLayout.scss";

const WindowLayout = ({ mainContent, windowContent, windowTitle }) => {
  const [open, setOpen] = useState(true);
  const [viewMode, setViewMode] = useState("overlay");

  return (
    <div className={`window-layout ${viewMode} ${open ? "open" : "closed"}`}>
      <main className="content-container">{mainContent}</main>
      <Window
        title={windowTitle}
        viewMode={viewMode}
        setViewMode={setViewMode}
        open={open}
        setOpen={setOpen}
      >
        {windowContent}
      </Window>
    </div>
  );
};

export default WindowLayout;
