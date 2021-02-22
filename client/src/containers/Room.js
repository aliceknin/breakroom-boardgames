import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import socketIOClient from "socket.io-client";
import GenerateName from "project-name-generator";
import Chat from "../components/Chat";
import Window from "../components/Window";
import Twixt from "../components/Twixt";
import "../styles/Room.scss";
import RoomContext from "../contexts/RoomContext";
import LoadingWrapper from "../components/LoadingWrapper";

const ENDPOINT = "http://localhost:4005";

const Room = () => {
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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

    function onConnect() {
      console.log("saw connection");
      socket.emit(
        "join room",
        { roomName, userName: socket.userName },
        (room) => {
          if (room.name === roomName) {
            setIsLoading(false);
            setConnected(true);
            socket.emit("room joined", { roomName, userName: socket.userName });
            console.log("room joined: ", roomName);
          } else {
            console.log("failed to join", roomName);
          }
        }
      );
    }

    function onDisconnect(reason) {
      console.log("disconnected:", reason);
      setConnected(false);
    }

    function onConnectError(error) {
      console.log("connect error:", error);
      setConnected(false);

      if (isLoading) {
        setIsLoading(false);
        // do something to distinguish an error when you've already
        // joined from an error trying to join (as in, nothing's loaded yet)
      }
    }

    function cleanup() {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("disconnect", onDisconnect);
      console.log("disconnecting");
      socket.disconnect();
    }

    function cleanupBeforeUnload() {
      console.log("cleaning up before unload");
      cleanup();
    }

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("disconnect", onDisconnect);
    window.addEventListener("beforeunload", cleanupBeforeUnload);

    return () => {
      console.log("unmounting...");
      cleanup();
      window.removeEventListener("beforeunload", cleanupBeforeUnload);
    };
  }, [roomName, isLoading]);

  return (
    <LoadingWrapper isLoading={isLoading}>
      <RoomContext.Provider value={{ socket, roomName, connected }}>
        <div className={"room " + mode}>
          <div className="content-container">
            {!connected && <div className="disconnected">Disconnected</div>}
            <h1>
              Welcome to room {roomName}
              {socket?.userName && ", " + socket.userName}!
            </h1>
            <Twixt />
          </div>
          <Window mode={mode} setMode={setMode}>
            <Chat />
          </Window>
        </div>
      </RoomContext.Provider>
    </LoadingWrapper>
  );
};

export default Room;
