import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import "../styles/Home.scss";

const Home = () => {
  const [roomName, setRoomName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleInputChange(e) {
    setRoomName(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    // some kind of input validation
    if (roomName) {
      setRoomName((r) => r.toLowerCase());
      setSubmitted(true);
    }
  }

  return (
    <div className="home">
      {submitted ? (
        <Redirect to={`/room/${roomName}`} />
      ) : (
        <header>
          <h1>Breakroom Boardgames</h1>
          <h2>Play games with friends anywhere with an internet connection.</h2>
          <form className="room-form input-group" onSubmit={handleSubmit}>
            <input
              type="text"
              // required
              aria-label="Name your game room"
              placeholder="Name your game room..."
              value={roomName}
              onChange={handleInputChange}
            ></input>
            <button type="submit">Play!</button>
          </form>
        </header>
      )}
    </div>
  );
};

export default Home;
