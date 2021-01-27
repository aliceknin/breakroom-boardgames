import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import socketIOClient from "socket.io-client";
import GenerateName from "project-name-generator";
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
    socket.userName = GenerateName().dashed;

    socket.on("connect", () => {
      console.log("saw connection");
      socket.emit(
        "join room",
        { roomName, userName: socket.userName },
        (room) => {
          if (room.name === roomName) {
            setConnected(true);
            room.chat && setMessages(room.chat);
            console.log("joined", roomName);
          } else {
            console.log("failed to join", roomName);
          }
        }
      );
    });

    const cleanup = () => {
      socket.emit(
        "leaving room",
        { roomName, userName: socket.userName },
        () => {
          console.log("disconnecting");
          socket.disconnect();
          setConnected(false);
        }
      );
    };

    const cleanupBeforeUnload = () => {
      console.log("cleaning up before unload");
      cleanup();
    };

    window.addEventListener("beforeunload", cleanupBeforeUnload);

    return () => {
      console.log("unmounting...");
      cleanup();
      window.removeEventListener("beforeunload", cleanupBeforeUnload);
    };
  }, [roomName]);

  return (
    <>
      {connected ? (
        <div className="room">
          <h1>
            Welcome to room {roomName}
            {socket.userName && ", " + socket.userName}!
          </h1>
          <Chat
            socket={socket}
            roomName={roomName}
            existingChat={messages}
            clearExistingChat={() => setMessages([])}
          />
        </div>
      ) : (
        <p>connecting...</p>
      )}
    </>
  );
};

export default Room;
