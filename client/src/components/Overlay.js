import React, { useState } from "react";
import "../styles/Overlay.scss";

const Overlay = ({ children, className }) => {
  const [closed, setClosed] = useState(false);

  function handleClick(e) {
    e.stopPropagation();
    setClosed(true);
  }

  return (
    !closed && (
      <div className={"game-overlay " + className}>
        <button className="close" onClick={handleClick}>
          <i className="close"></i>
        </button>
        {children}
      </div>
    )
  );
};

export default Overlay;
