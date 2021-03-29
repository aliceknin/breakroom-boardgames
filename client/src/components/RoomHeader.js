import React, { useState } from "react";
import BannerAlert from "./BannerAlert";

const RoomHeader = ({ socket, roomName }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyCount, setCopyCount] = useState(0);

  function copyURL() {
    console.log("trying to copy " + window.location);
    navigator.clipboard.writeText(window.location);
    setCopyCount((c) => c + 1);
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
        <BannerAlert
          className="copied"
          onClose={() => setCopied(false)}
          refresh={copyCount}
        >
          Copied!
        </BannerAlert>
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
