import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { SERVER_ENDPOINT } from "../utils/constants";
import "../styles/Home.scss";

const Home = () => {
  const [roomName, setRoomName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  /* In theory, this will wake up the heroku instance if it
  is sleeping, so that by the time someone tries to create a
  room, it will be responsive.*/
  useEffect(() => {
    async function pingServer() {
      try {
        const res = await fetch(SERVER_ENDPOINT + "/ping");
        const data = await res.text();
        console.log(data);
      } catch (err) {
        console.log(err);
      }
    }
    pingServer();
  }, []);

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
