import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import socketIOClient from "socket.io-client";
import Chat from "../components/Chat";
import "../styles/Room.scss";

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
    });

    // maybe do something with acknowledgement functions instead?
    socket.on("room joined", (room) => {
      if (room.name === roomName) {
        setConnected(true);
        room.chat && setMessages(room.chat);
        console.log("joined", roomName);
      } else {
        console.log("failed to join", roomName);
      }
    });

    const cleanup = () => {
      console.log("disconnecting");
      socket.emit("leaving room", roomName, () => {
        socket.disconnect();
      });
    };

    window.addEventListener("beforeunload", cleanup);

    return () => {
      cleanup();
      window.removeEventListener("beforeunload", cleanup);
    };
  }, [roomName]);

  return (
    <>
      {connected ? (
        <div className="room">
          <h1>Welcome to room {roomName}!</h1>
          <Chat socket={socket} roomName={roomName} existingChat={messages} />
        </div>
      ) : (
        <p>connecting...</p>
      )}
    </>
  );
};

export default Room;
