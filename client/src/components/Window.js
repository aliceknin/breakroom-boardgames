import React, { useState } from "react";
import "../styles/Window.scss";

const Window = ({ children, mode, setMode }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className={"window " + mode + (open ? " open" : " closed")}>
      <div className="bar">
        <span className="title">Room Chat</span>
        <span className="buttons-container">
          <button
            className={open ? "open" : "closed"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "_" : "^"}
          </button>
          {mode !== "overlay" && (
            <button className="overlay" onClick={() => setMode("overlay")}>
              <div>O</div>
            </button>
          )}
          {mode !== "dock-side" && (
            <button className="dock-side" onClick={() => setMode("dock-side")}>
              _|
            </button>
          )}
          {mode !== "dock-bottom" && (
            <button
              className="dock-bottom"
              onClick={() => setMode("dock-bottom")}
            >
              |_|
            </button>
          )}
        </span>
      </div>
      <div className={open ? "content-open" : "content-closed"}>{children}</div>
    </div>
  );
};

export default Window;
