import React, { useEffect, useState } from "react";
// import TwixtHole from "./TwixtHole";
import "../styles/Twixt.scss";

const TwixtBoard = ({ socket, roomName, gameState, clearGameState }) => {
  const [board, setBoard] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(true);
  const [linkMode, setLinkMode] = useState(false);

  useEffect(() => {
    console.log("a fresh start");
    let b = Array(24);
    for (let i = 0; i < b.length; i++) {
      b[i] = Array(24).fill("empty");
    }
    setBoard(b);
    socket.emit("game joined", roomName);
  }, [socket, roomName]);

  useEffect(() => {
    function gameStateChange(newState) {
      console.log("someone else changed the game's state!");
      newState && setBoard(newState);
      setCurrentPlayer((p) => !p);
    }

    console.log("registering those blessed game listeners...");
    socket.on("game state change", gameStateChange);
    return () => {
      console.log("removing game listeners...");
      socket.off("game state change", gameStateChange);
    };
  }, [socket]);

  function handleHoleClick(e) {
    if (linkMode) {
      canLink(Number(e.target.dataset.row), Number(e.target.dataset.column));
    } else {
      let b = [...board];
      b[e.target.dataset.row][e.target.dataset.column] = currentPlayer
        ? "red"
        : "black";
      setBoard(b);
      socket.emit("move", { newState: b, roomName });
      setCurrentPlayer((p) => !p);
    }
  }

  function resetBoard() {
    let b = Array(24);
    for (let i = 0; i < b.length; i++) {
      b[i] = Array(24).fill("empty");
    }
    setBoard(b);
    socket.emit("move", { newState: b, roomName });
  }

  function getPossibleLinks(row, col) {
    return [
      { row: row + 2, col: col + 1 },
      { row: row + 2, col: col - 1 },
      { row: row - 2, col: col + 1 },
      { row: row - 2, col: col - 1 },
      { row: row + 1, col: col + 2 },
      { row: row + 1, col: col - 2 },
      { row: row - 1, col: col + 2 },
      { row: row - 1, col: col - 2 },
    ];
  }

  function canLink(row, col) {
    let startPeg = board[row][col];
    let b = [...board];
    for (let link of getPossibleLinks(row, col)) {
      if (link.row >= 0 && link.row < 24 && link.col >= 0 && link.col < 24) {
        let endPeg = b[link.row][link.col];
        if (startPeg === endPeg) {
          b[link.row][link.col] = "possible-link";
        }
      }
    }

    setBoard(b);
  }

  return (
    <div className="twixt-container">
      <div className="twixt-board">
        {board.map((row, i) =>
          row.map((hole, j) => (
            <div
              key={`(${j + 1},${i + 1})`}
              id={`coords-${j + 1}-${i + 1}`}
              data-row={i}
              data-column={j}
              className={"twixt-hole " + hole}
              onClick={handleHoleClick}
            >
              .
            </div>
          ))
        )}
      </div>
      <button onClick={resetBoard}>Reset Board</button>
      <button onClick={() => setLinkMode((m) => !m)}>
        {linkMode ? "Peg Mode" : "Link Mode"}
      </button>
    </div>
  );
};

export default TwixtBoard;
