import React, { useContext, useEffect, useState } from "react";
import RoomContext from "../contexts/RoomContext";
import TurnInfo from "./TurnInfo";

const withGameManager = (GameComponent, roles, getInitialBoard) => () => {
  const [board, setBoard] = useState(getInitialBoard());
  const [turnMode, setTurnMode] = useState(true);
  const [actionsThisTurn, setActionsThisTurn] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [players, setPlayers] = useState({});
  const [myRole, setMyRole] = useState(0);
  const [winner, setWinner] = useState(null);
  const { socket, roomName, connected } = useContext(RoomContext);

  useEffect(() => {
    if (connected) {
      console.log("connected, joining game");
      socket.emit("game joined", { roomName, roles });
    }
  }, [socket, roomName, connected]);

  useEffect(() => {
    function gameStateChange(newState) {
      console.log("the game's state changed!");
      newState && setBoard(newState);
    }

    function onPlayerChange(players) {
      console.log("the game's players changed!");
      setPlayers(players);
    }

    function onTurnChange(newCurrentPlayer) {
      setCurrentPlayer(newCurrentPlayer);
      console.log("new current player:", newCurrentPlayer);
    }

    function onRoomJoined(data) {
      if (data.roomName === roomName && data.userName === socket.userName) {
        console.log("joined room, trying to join game");
        socket.emit("game joined", { roomName, roles });
      }
    }

    function onSetTurnMode(turnMode) {
      setTurnMode(turnMode);
      turnMode && setActionsThisTurn([]);
      console.log("turn mode:", turnMode);
    }

    function onWin(player) {
      player && console.log("someone won:", player);
      setWinner(player);
    }

    console.log("registering game listeners...");
    socket.on("game state change", gameStateChange);
    socket.on("player change", onPlayerChange);
    socket.on("turn change", onTurnChange);
    socket.on("room joined", onRoomJoined);
    socket.on("broadcast turn mode", onSetTurnMode);
    socket.on("someone won", onWin);

    return () => {
      console.log("removing game listeners...");
      socket.off("game state change", gameStateChange);
      socket.off("player change", onPlayerChange);
      socket.off("turn change", onTurnChange);
      socket.off("room joined", onRoomJoined);
      socket.off("broadcast turn mode", onSetTurnMode);
      socket.off("someone won", onWin);
    };
  }, [socket, roomName]);

  function makeMove(newState) {
    setBoard(newState);
    socket.emit("move", { newState, roomName });
  }

  function getTurnBasedPlayerColor() {
    return players[socket.userName] || players[socket.id];
  }

  function getMyPlayerColor() {
    if (turnMode) {
      return getTurnBasedPlayerColor();
    } else {
      return roles[myRole];
    }
  }

  function isMyPlayerColor(color) {
    return color === getMyPlayerColor();
  }

  function switchPlayer() {
    let role = myRole >= roles.length - 1 ? 0 : myRole + 1;
    setMyRole(role);
  }

  function isMyTurn() {
    if (turnMode) {
      return (
        currentPlayer &&
        (currentPlayer[1] === socket.userName || currentPlayer[1] === socket.id)
      );
    } else {
      return true;
    }
  }

  function endTurn() {
    socket.emit("turn ended", roomName);
    setActionsThisTurn([]);
  }

  function toggleTurnMode() {
    console.log("setting turn mode...");
    socket.emit("set turn mode", {
      turnMode: !turnMode,
      roomName,
    });
    setTurnMode((s) => !s);
    !turnMode && setActionsThisTurn([]);
  }

  function onPlayerWin() {
    console.log("WE WON! (we won) WE WON! (we won)");
    let player = [getMyPlayerColor(), socket.userName || socket.id];
    broadcastWinner(player);
  }

  function broadcastWinner(player) {
    setWinner(player);
    socket.emit("we won", { player, roomName });
  }

  return (
    <div className="game-manager">
      <TurnInfo
        turnMode={turnMode}
        toggleTurnMode={toggleTurnMode}
        currentPlayer={currentPlayer}
        switchPlayer={switchPlayer}
        getMyPlayerColor={getMyPlayerColor}
        winner={winner}
      />
      <GameComponent
        board={board}
        getInitialBoard={getInitialBoard}
        makeMove={makeMove}
        isMyTurn={isMyTurn}
        getMyPlayerColor={getMyPlayerColor}
        isMyPlayerColor={isMyPlayerColor}
        onPlayerWin={onPlayerWin}
        winner={winner}
        broadcastWinner={broadcastWinner}
        turnMode={turnMode}
        endTurn={endTurn}
        actionsThisTurn={actionsThisTurn}
        setActionsThisTurn={setActionsThisTurn}
      />
    </div>
  );
};

export default withGameManager;
