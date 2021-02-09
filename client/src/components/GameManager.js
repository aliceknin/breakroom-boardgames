import React, { useEffect, useState } from "react";
import TurnInfo from "./TurnInfo";

const withGameManager = (GameComponent, roles, getInitialBoard) => ({
  socket,
  roomName,
}) => {
  const [board, setBoard] = useState([]);
  const [shouldManageTurns, setShouldManageTurns] = useState(true);
  const [actionsThisTurn, setActionsThisTurn] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [players, setPlayers] = useState({});
  const [myColor, setMyColor] = useState(true);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    console.log("a fresh start");
    setBoard(getInitialBoard());
    joinGame(roles);

    function joinGame(roles) {
      socket.emit("game joined", { roomName, roles });
    }

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
        joinGame(roles);
      }
    }

    function onSetTurnManagement(shouldManageTurns) {
      setShouldManageTurns(shouldManageTurns);
      shouldManageTurns && setActionsThisTurn([]);
      console.log("should manage turns:", shouldManageTurns);
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
    socket.on("broadcast turn management", onSetTurnManagement);
    socket.on("someone won", onWin);

    return () => {
      console.log("removing game listeners...");
      socket.off("game state change", gameStateChange);
      socket.off("player change", onPlayerChange);
      socket.off("turn change", onTurnChange);
      socket.off("room joined", onRoomJoined);
      socket.off("broadcast turn management", onSetTurnManagement);
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
    if (shouldManageTurns) {
      return getTurnBasedPlayerColor();
    } else {
      return myColor ? "red" : "black";
    }
  }

  function isMyPlayerColor(color) {
    return color === getMyPlayerColor();
  }

  function switchPlayer() {
    setMyColor((c) => !c);
  }

  function isMyTurn() {
    if (shouldManageTurns) {
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

  function toggleManageTurns() {
    console.log("setting turn management...");
    setMyColor(getTurnBasedPlayerColor() === "red");
    socket.emit("set turn management", {
      shouldManageTurns: !shouldManageTurns,
      roomName,
    });
    setShouldManageTurns((s) => !s);
    !shouldManageTurns && setActionsThisTurn([]);
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
        shouldManageTurns={shouldManageTurns}
        toggleManageTurns={toggleManageTurns}
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
        shouldManageTurns={shouldManageTurns}
        endTurn={endTurn}
        actionsThisTurn={actionsThisTurn}
        setActionsThisTurn={setActionsThisTurn}
      />
    </div>
  );
};

export default withGameManager;
