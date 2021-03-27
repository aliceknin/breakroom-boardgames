import React, { useState } from "react";

const RoomHeader = ({ socket, roomName }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyURL() {
    console.log("trying to copy " + window.location);
    navigator.clipboard.writeText(window.location);
    setCopied(true);
  }

  return (
    <header>
      <div className="home-link-wrapper">
        <a className="home-link" href="/">
          Breakroom Boardgames
        </a>
      </div>
      {copied && (
        <div className="alert copied">
          Copied!{" "}
          <button className="close" onClick={() => setCopied(false)}>
            <i className="close"></i>
          </button>
        </div>
      )}
      <button onClick={() => setDropdownOpen((o) => !o)} className="menu">
        <i className="fas fa-info"></i>
      </button>
      <div className={"dropdown-content" + (dropdownOpen ? " open" : "")}>
        <div className="room-name">
          Game Room: <span>{roomName}</span>
          <button onClick={copyURL} className="copy-url">
            {/* <i
              className="far fa-clipboard"
              aria-label="Copy the room link to share with your friends!"
              data-label-popup
            ></i> */}
            <i
              className="fas fa-link"
              aria-label="Copy the room link to share with your friends!"
              data-label-popup
            ></i>
          </button>
        </div>
        <div className="username">
          Hi{socket?.userName && ", " + socket.userName}!
        </div>
      </div>
    </header>
  );
};

export default RoomHeader;
