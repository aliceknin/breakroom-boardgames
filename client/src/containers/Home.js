import React, { useState } from "react";
import "../styles/Home.scss";

const Home = () => {
  const [roomName, setRoomName] = useState("");

  function handleInputChange(e) {
    setRoomName(e.target.value);
  }
 
  function handleSubmit(e) {
    e.preventDefault();
    // something here that redirects them to a room with
    // the given name
  }

  return (
    <header>
      <h1>Breakroom Boardgames</h1>
      <h3>play some games or something</h3>
      <form className="room-form" onSubmit={handleSubmit}>
        <input type="text"
          required
          aria-label="Join or create a room"
          placeholder="Join or create a room..."
          value={roomName}
          onChange={handleInputChange}></input>
        <button type="submit">
          Play!
        </button>
      </form>
    </header>
  );
};

export default Home;
