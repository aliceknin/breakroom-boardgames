import React, { useState } from "react";

const RoomHeader = ({ socket, roomName }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedTimeout, setCopiedTimeout] = useState(null);

  function copyURL() {
    console.log("trying to copy " + window.location);
    navigator.clipboard.writeText(window.location);
    setCopied(true);
    let timeoutID = setTimeout(() => setCopied(false), 2000);
    setCopiedTimeout(timeoutID);
  }

  function closeCopyAlert() {
    clearTimeout(copiedTimeout);
    setCopied(false);
    setCopiedTimeout(null);
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
          <button className="close" onClick={closeCopyAlert}>
            <i className="close"></i>
          </button>
        </div>
      )}
      <button onClick={() => setDropdownOpen((o) => !o)} className="menu">
        <i className="fas fa-info"></i>
      </button>
      <div className={"dropdown-content" + (dropdownOpen ? " open" : "")}>
        <div className="room-name">
          <button
            onClick={copyURL}
            className="copy-url"
            aria-label="Copy the room link to invite your friends!"
            data-label-popup
          >
            Game Room: <span>{roomName}</span>
            {/* <i className="far fa-clipboard"></i> */}
            <i className="fas fa-link"></i>
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
