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
              aria-label={open ? "Minimize" : "Maximize"}
              onClick={() => setOpen((o) => !o)}
            >
              <i
                className={
                  open ? "far fa-window-minimize" : "fas fa-chevron-up"
                }
              />
            </button>
            <span className="mode-buttons" onClick={handleClick}>
              {viewMode !== "overlay" && (
                <button
                  className="overlay"
                  aria-label="Overlay"
                  data-label-popup
                >
                  <i className="far fa-window-restore"></i>
                </button>
              )}
              {viewMode !== "dock-side" && (
                <button
                  className="dock-side"
                  aria-label="Dock side"
                  data-label-popup
                >
                  <i className="far fa-window-maximize"></i>
                </button>
              )}
              {viewMode !== "dock-bottom" && (
                <button
                  className="dock-bottom"
                  aria-label="Dock Bottom"
                  data-label-popup
                >
                  <i className="far fa-window-maximize"></i>
                </button>
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
