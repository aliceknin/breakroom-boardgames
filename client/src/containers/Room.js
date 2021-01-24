import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import socketIOClient from "socket.io-client";

const ENDPOINT = "http://localhost:4005";

const Room = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const { roomName } = useParams();

  useEffect(() => {
    console.log("trying to connect...");
    const socket =
      process.env.NODE_ENV === "production"
        ? socketIOClient()
        : socketIOClient(ENDPOINT);
    setSocket(socket);

    socket.on("got you", () => {
      console.log("saw connection");
      socket.emit("join room", roomName);

      // maybe do something with acknowledgement functions instead?
      socket.on("room joined", (data) => {
        if (data === roomName) {
          setConnected(true);
          console.log("joined", roomName);
        }
      });

      socket.on("msg", (data) => {
        setMessages((msgs) => msgs.concat(data));
      });
    });
    
    return () => {
      console.log("disconnecting");
      socket.emit("leaving room", roomName, () => {
        socket.disconnect();
      });
    };
  }, [roomName]);

  function leaveRoom(e) {
    socket.emit("leaving room", roomName);
  }

  return (
    <>
      {connected ? (
        <div>
          <h1>Welcome to room {roomName}!</h1>
          {messages.map((msg) => (
            <p key={msg + roomName}>{msg}</p>
          ))}
          <button onClick={leaveRoom}>Leave Room</button>
        </div>
      ) : (
        <p>connecting...</p>
      )}
    </>
  );
};

export default Room;
