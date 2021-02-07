import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import socketIOClient from "socket.io-client";
import GenerateName from "project-name-generator";
import Chat from "../components/Chat";
import Window from "../components/Window";
import Twixt from "../components/Twixt";
import "../styles/Room.scss";

const ENDPOINT = "http://localhost:4005";

const Room = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { roomName } = useParams();
  const [mode, setMode] = useState("overlay");

  useEffect(() => {
    console.log("trying to connect...");
    const socket =
      process.env.NODE_ENV === "production"
        ? socketIOClient()
        : socketIOClient(ENDPOINT);
    setSocket(socket);
    socket.userName = GenerateName().dashed;

    const onConnect = () => {
      console.log("saw connection");
      socket.emit(
        "join room",
        { roomName, userName: socket.userName },
        (room) => {
          if (room.name === roomName) {
            setConnected(true);
            socket.emit("room joined", { roomName, userName: socket.userName });
            console.log("room joined: ", roomName);
          } else {
            console.log("failed to join", roomName);
          }
        }
      );
    };

    const cleanup = () => {
      socket.off("connect", onConnect);
      console.log("disconnecting");
      socket.disconnect();
    };

    const cleanupBeforeUnload = () => {
      console.log("cleaning up before unload");
      cleanup();
    };

    socket.on("connect", onConnect);
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
        <div className={"room " + mode}>
          <div className="content-container">
            <h1>
              Welcome to room {roomName}
              {socket.userName && ", " + socket.userName}!
            </h1>
            <Twixt socket={socket} roomName={roomName} />
          </div>
          <Window mode={mode} setMode={setMode}>
            <Chat socket={socket} roomName={roomName} />
          </Window>
        </div>
      ) : (
        <p>connecting...</p>
      )}
    </>
  );
};

export default Room;
