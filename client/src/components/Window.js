import React from "react";
import "../styles/Window.scss";

const Window = ({ children, title, viewMode, setViewMode, open, setOpen }) => {
  function handleClick(e) {
    let viewMode = e.target.closest("button").className;
    setOpen(true);
    setViewMode(viewMode);
  }

  return (
    <aside className={`window ${viewMode} ${open ? "open" : "closed"}`}>
      <div className="window-container">
        <div className="bar">
          <span className="title">{title}</span>
          <span className="buttons-container">
            <button
              className={open ? "open" : "closed"}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? "_" : "^"}
            </button>
            <span className="mode-buttons" onClick={handleClick}>
              {viewMode !== "overlay" && <button className="overlay">O</button>}
              {viewMode !== "dock-side" && (
                <button className="dock-side">_|</button>
              )}
              {viewMode !== "dock-bottom" && (
                <button className="dock-bottom">|_|</button>
              )}
            </span>
          </span>
        </div>
        <div className={open ? "content-open" : "content-closed"}>
          {children}
        </div>
      </div>
    </aside>
  );
};

export default Window;
