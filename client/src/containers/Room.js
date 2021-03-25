import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import socketIOClient from "socket.io-client";
import GenerateName from "project-name-generator";
import Chat from "../components/Chat";
import WindowLayout from "../components/WindowLayout";
import Twixt from "../components/Twixt";
import "../styles/Room.scss";
import RoomContext from "../contexts/RoomContext";
import LoadingWrapper from "../components/LoadingWrapper";

const ENDPOINT = "http://localhost:4005";

const Room = () => {
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [connected, setConnected] = useState(false);
  const { roomName } = useParams();

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
            setHasFailed(false);
            setConnected(true);
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
        setHasFailed(true);
      }
    }

    function cleanup() {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("disconnect", onDisconnect);
      console.log("disconnecting");
      socket.disconnect();
    }

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("disconnect", onDisconnect);
    window.addEventListener("beforeunload", cleanup);

    return () => {
      console.log("unmounting...");
      cleanup();
      window.removeEventListener("beforeunload", cleanup);
    };
    /* since isLoading is used in an event listener rather than just the 
       useEffect, I don't actually want this to be called when it changes*/
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName]);

  return (
    <LoadingWrapper
      isLoading={isLoading}
      hasFailed={hasFailed}
      errorMessage="Something went wrong connecting to the server. Try restarting it?"
    >
      <RoomContext.Provider value={{ socket, roomName, connected }}>
        <div className="room">
          {!connected && <div className="disconnected">Disconnected</div>}
          <header>
            <div className="home-link-wrapper">
              <a className="home-link" href="/">
                Breakroom Boardgames
              </a>
            </div>
            <button className="menu">
              <i className="fas fa-info"></i>
            </button>
            <div className="dropdown-content">
              <div className="room-name">
                Game Room: <span>{roomName}</span>
              </div>
              <div className="username">
                Hi{socket?.userName && ", " + socket.userName}!
              </div>
            </div>
          </header>
          <WindowLayout
            mainContent={
              <section>
                <Twixt />
              </section>
            }
            windowContent={<Chat />}
            windowTitle="Room Chat"
          />
        </div>
      </RoomContext.Provider>
    </LoadingWrapper>
  );
};

export default Room;
