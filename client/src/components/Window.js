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
      <div className="bar">
        <span className="title">{title}</span>
        <span className="buttons-container">
          <button
            className={open ? "open" : "closed"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "_" : "^"}
          </button>
          {viewMode !== "overlay" && (
            <button className="overlay" onClick={handleClick}>
              O
            </button>
          )}
          {viewMode !== "dock-side" && (
            <button className="dock-side" onClick={handleClick}>
              _|
            </button>
          )}
          {viewMode !== "dock-bottom" && (
            <button className="dock-bottom" onClick={handleClick}>
              |_|
            </button>
          )}
        </span>
      </div>
      <div className={open ? "content-open" : "content-closed"}>{children}</div>
    </aside>
  );
};

export default Window;
