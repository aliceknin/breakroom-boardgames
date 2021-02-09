import React, { useState } from "react";
import "../styles/Overlay.scss";

const Overlay = ({ children, className }) => {
  const [closed, setClosed] = useState(false);

  return (
    !closed && (
      <div className={"game-overlay " + className}>
        <button className="close" onClick={() => setClosed(true)}>
          X
        </button>
        {children}
      </div>
    )
  );
};

export default Overlay;
