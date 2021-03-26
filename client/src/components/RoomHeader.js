import React, { useState } from "react";

const RoomHeader = ({ socket, roomName }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header>
      <div className="home-link-wrapper">
        <a className="home-link" href="/">
          Breakroom Boardgames
        </a>
      </div>
      <button onClick={() => setDropdownOpen((o) => !o)} className="menu">
        <i className="fas fa-info"></i>
      </button>
      <div className={"dropdown-content" + (dropdownOpen ? " open" : "")}>
        <div className="room-name">
          Game Room: <span>{roomName}</span>
        </div>
        <div className="username">
          Hi{socket?.userName && ", " + socket.userName}!
        </div>
      </div>
    </header>
  );
};

export default RoomHeader;
