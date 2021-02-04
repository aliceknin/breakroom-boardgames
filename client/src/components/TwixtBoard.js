import React, { useEffect, useState } from "react";
import "../styles/Twixt.scss";

const TwixtBoard = ({ socket, roomName }) => {
  const [board, setBoard] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [linkMode, setLinkMode] = useState(false);
  const [firstPeg, setFirstPeg] = useState(null);
  const [secondLinkClick, setSecondLinkClick] = useState(false);
  const [players, setPlayers] = useState({});
  const [actionsThisTurn, setActionsThisTurn] = useState([]);
  const [shouldManageTurns, setShouldManageTurns] = useState(true);
  const [myColor, setMyColor] = useState(true);

  useEffect(() => {
    console.log("a fresh start");
    let b = Array(24);
    for (let i = 0; i < b.length; i++) {
      let row = Array(24);
      for (let j = 0; j < row.length; j++) {
        row[j] = { color: "empty", links: [], isPossibleLink: "" };
      }
      b[i] = row;
    }
    setBoard(b);
    joinGame();

    function joinGame() {
      let roles = ["red", "black"];
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
        joinGame();
      }
    }

    function onSetTurnManagement(shouldManageTurns) {
      setShouldManageTurns(shouldManageTurns);
      shouldManageTurns && setActionsThisTurn([]);
      console.log("should manage turns:", shouldManageTurns);
    }

    console.log("registering game listeners...");
    socket.on("game state change", gameStateChange);
    socket.on("player change", onPlayerChange);
    socket.on("turn change", onTurnChange);
    socket.on("room joined", onRoomJoined);
    socket.on("set turn management", onSetTurnManagement);

    return () => {
      console.log("removing game listeners...");
      socket.off("game state change", gameStateChange);
      socket.off("player change", onPlayerChange);
      socket.off("turn change", onTurnChange);
      socket.off("room joined", onRoomJoined);
      socket.on("set turn management", onSetTurnManagement);
    };
  }, [socket, roomName]);

  function handleHoleClick(e) {
    if (!isMyTurn()) {
      return;
    }
    let hole = e.target.closest(".twixt-hole");
    if (!hole) {
      console.log("misclick, yo");
      return;
    }

    let b = [...board];
    let row = Number(hole.dataset.row);
    let col = Number(hole.dataset.col);
    hole = b[row][col];

    if (linkMode) {
      console.log("link mode");
      handleLinkMode(b, row, col, hole.color);
    } else {
      console.log("peg mode");
      handlePegMode(b, row, col, hole.color);
    }
  }

  function handlePegMode(b, row, col, color) {
    if (color === "empty") {
      if (!isAcrossThreshold(row, col, false)) {
        b[row][col].color = getMyPlayerColor();
        makeMove(b);
        setActionsThisTurn((a) => a.concat({ action: "peg", row, col }));
      }
    } else if (isMyPlayerColor(color)) {
      console.log("switching to link mode");
      setLinkMode(true);
      startLink(b, row, col);
    }
  }

  function handleLinkMode(b, row, col, color) {
    if (secondLinkClick) {
      if (canLink(firstPeg, { row, col })) {
        completeLink(b, row, col);
      } else {
        console.log("couldn't link", firstPeg, "to", { row, col });
        makeMove(exitLinkMode(b));
      }
    } else {
      if (isMyPlayerColor(color)) {
        startLink(b, row, col);
      } else {
        console.log(`${getMyPlayerColor()} can't start link with ${color} peg`);
      }
    }
  }

  function startLink(b, row, col) {
    console.log(`set first peg: (${row},${col})`);
    setFirstPeg({ row, col });
    setSecondLinkClick(true);
    makeMove(togglePossibleLinks(row, col, b, true));
  }

  function completeLink(b, row, col) {
    b = exitLinkMode(b);
    b[firstPeg.row][firstPeg.col].links.push({ row, col });
    b[row][col].links.push(firstPeg);
    makeMove(b);
    setActionsThisTurn((a) =>
      a.concat({
        action: "link",
        startPegCoords: firstPeg,
        endPegCoords: { row, col },
      })
    );
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

  function makeMove(newState) {
    setBoard(newState);
    socket.emit("move", { newState, roomName });
  }

  function exitLinkMode(b) {
    b = b || board;
    if (firstPeg) {
      b = togglePossibleLinks(firstPeg.row, firstPeg.col, board, false);
    }
    setLinkMode(false);
    setSecondLinkClick(false);
    setFirstPeg(null);
    return b;
  }

  function resetBoard() {
    let prevBoard = [...board];
    prevBoard = linkMode ? exitLinkMode(prevBoard) : prevBoard;

    let b = Array(24);
    for (let i = 0; i < b.length; i++) {
      let row = Array(24);
      for (let j = 0; j < row.length; j++) {
        row[j] = { color: "empty", links: [], isPossibleLink: "" };
      }
      b[i] = row;
    }

    makeMove(b);
    setActionsThisTurn((a) => a.concat({ action: "reset", prevBoard }));
  }

  function endTurn() {
    linkMode && makeMove(exitLinkMode());
    socket.emit("turn ended", roomName);
    setActionsThisTurn([]);
  }

  function removePeg(b, row, col) {
    let peg = b[row][col];
    if (peg.links.length === 0) {
      peg.color = "empty";
      return b;
    }
  }

  function unlink(b, startPegCoords, endPegCoords) {
    let startPeg = b[startPegCoords.row][startPegCoords.col];
    let endPeg = b[endPegCoords.row][endPegCoords.col];
    let startLinks = [...startPeg.links];
    let endLinks = [...endPeg.links];

    if (
      removeLink(startLinks, endPegCoords) &&
      removeLink(endLinks, startPegCoords)
    ) {
      startPeg.links = startLinks;
      endPeg.links = endLinks;
      return b;
    }
  }

  function undoLastAction() {
    if (actionsThisTurn.length > 0) {
      let b = [...board];
      let actions = [...actionsThisTurn];
      let lastAction = actions.pop();
      let modifiedBoard;

      switch (lastAction.action) {
        case "peg":
          modifiedBoard = removePeg(b, lastAction.row, lastAction.col);
          break;
        case "link":
          modifiedBoard = unlink(
            b,
            lastAction.startPegCoords,
            lastAction.endPegCoords
          );
          break;
        case "reset":
          modifiedBoard = lastAction.prevBoard;
          break;
        default:
          console.log("tried to undo unexpected action");
      }

      if (modifiedBoard) {
        modifiedBoard = linkMode ? exitLinkMode(modifiedBoard) : modifiedBoard;
        makeMove(modifiedBoard);
        setActionsThisTurn(actions);
        console.log("undid", lastAction);
      } else {
        console.log("failed to undo", lastAction);
      }
    }
  }

  function switchPlayer() {
    linkMode && makeMove(exitLinkMode());
    setMyColor((c) => !c);
  }

  function toggleManageTurns() {
    linkMode && makeMove(exitLinkMode());
    console.log("setting turn management...");
    setMyColor(getTurnBasedPlayerColor() === "red");
    socket.emit("set turn management", {
      shouldManageTurns: !shouldManageTurns,
      roomName,
    });
    setShouldManageTurns((s) => !s);
  }

  function getPossibleLinks(row, col) {
    let calculatedLinks = [
      { row: row + 2, col: col + 1 },
      { row: row + 2, col: col - 1 },
      { row: row - 2, col: col + 1 },
      { row: row - 2, col: col - 1 },
      { row: row + 1, col: col + 2 },
      { row: row + 1, col: col - 2 },
      { row: row - 1, col: col + 2 },
      { row: row - 1, col: col - 2 },
    ];

    let possibleLinks = [];

    for (let link of calculatedLinks) {
      if (link.row >= 0 && link.row < 24 && link.col >= 0 && link.col < 24) {
        possibleLinks.push(link);
      }
    }

    return possibleLinks;
  }

  function linkEquals(firstLink, secondLink) {
    return firstLink.row === secondLink.row && firstLink.col === secondLink.col;
  }

  function removeLink(links, endPegCoords) {
    for (let i = 0; i < links.length; i++) {
      if (linkEquals(links[i], endPegCoords)) {
        return links.splice(i, 1);
      }
    }

    return false;
  }

  function hasLink(links, endPegCoords) {
    for (let link of links) {
      if (linkEquals(link, endPegCoords)) {
        return true;
      }
    }

    return false;
  }

  function hasLinkWhere(x, y, xyConditions) {
    let links = board[y][x].links;

    for (let link of links) {
      if (xyConditions(link.col, link.row)) {
        return true;
      }
    }

    return false;
  }

  function linkIsBlocked(startPegCoords, endPegCoords) {
    let minXPeg, maxXPeg, minX, maxX, minY, maxY;
    if (startPegCoords.col < endPegCoords.col) {
      minXPeg = startPegCoords;
      maxXPeg = endPegCoords;
    } else {
      maxXPeg = startPegCoords;
      minXPeg = endPegCoords;
    }
    minX = minXPeg.col;
    maxX = maxXPeg.col;
    console.log("minX:", minX, "maxX:", maxX);
    if (
      Math.abs(startPegCoords.col - endPegCoords.col) <
      Math.abs(startPegCoords.row - endPegCoords.row)
    ) {
      let midY;
      if (minXPeg.row < maxXPeg.row) {
        /*          \
                     \
                      \
                       \
                        \
        */
        minY = minXPeg.row;
        maxY = maxXPeg.row;
        midY = minY + 1;
        console.log("minY:", minY, "midY;", midY, "maxY:", maxY);
        return (
          hasLinkWhere(maxX, minY, (x, y) => {
            return x < maxX && y > minY;
          }) ||
          hasLinkWhere(minX, midY, (x, y) => {
            return x > minX && y <= maxY;
          }) ||
          hasLinkWhere(maxX, midY, (x, y) => {
            return x < maxX && y >= minY;
          }) ||
          hasLinkWhere(minX, maxY, (x, y) => {
            return x > minX && y < maxY;
          })
        );
      } else {
        /*
                        /
                       /
                      /
                     /
                    /
        */
        minY = maxXPeg.row;
        maxY = minXPeg.row;
        midY = minY + 1;
        console.log("minY:", minY, "midY;", midY, "maxY:", maxY);
        return (
          hasLinkWhere(maxX, maxY, (x, y) => {
            return x < maxX && y < maxY;
          }) ||
          hasLinkWhere(minX, midY, (x, y) => {
            return x > minX && y >= minY;
          }) ||
          hasLinkWhere(maxX, midY, (x, y) => {
            return x < maxX && y <= maxY;
          }) ||
          hasLinkWhere(minX, minY, (x, y) => {
            return x > minX && y > minY;
          })
        );
      }
    } else {
      let midX = minX + 1;
      if (minXPeg.row < maxXPeg.row) {
        /*
                ' .
                    ' .
                        ' .
        */
        minY = minXPeg.row;
        maxY = maxXPeg.row;
        console.log("minY:", minY, "midX:", midX, "maxY:", maxY);
        return (
          hasLinkWhere(minX, maxY, (x, y) => {
            return x > minX && y < maxY;
          }) ||
          hasLinkWhere(midX, minY, (x, y) => {
            return x <= maxX && y > minY;
          }) ||
          hasLinkWhere(midX, maxY, (x, y) => {
            return x >= minX && y < maxY;
          }) ||
          hasLinkWhere(maxX, minY, (x, y) => {
            return x < maxX && y > minY;
          })
        );
      } else {
        /*
                         . '
                     . '
                 . '
        */
        minY = maxXPeg.row;
        maxY = minXPeg.row;
        console.log("minY:", minY, "midX:", midX, "maxY:", maxY);
        return (
          hasLinkWhere(maxX, maxY, (x, y) => {
            return x < maxX && y < maxY;
          }) ||
          hasLinkWhere(midX, minY, (x, y) => {
            return x >= minX && y > minY;
          }) ||
          hasLinkWhere(midX, maxY, (x, y) => {
            return x <= maxX && y < maxY;
          }) ||
          hasLinkWhere(minX, minY, (x, y) => {
            return x > minX && y > minY;
          })
        );
      }
    }
  }

  function canLink(startPegCoords, endPegCoords, b) {
    b = b || board;
    let startPeg = b[startPegCoords.row][startPegCoords.col];
    let endPeg = b[endPegCoords.row][endPegCoords.col];

    startPeg.possibleLinks =
      startPeg.possibleLinks ||
      getPossibleLinks(startPegCoords.row, startPegCoords.col);

    return (
      (startPeg.isFirstPeg && endPeg.isPossibleLink) ||
      (startPeg.color === endPeg.color &&
        !hasLink(startPeg.links, endPegCoords) &&
        hasLink(startPeg.possibleLinks, endPegCoords) &&
        !linkIsBlocked(startPegCoords, endPegCoords))
    );
  }

  function togglePossibleLinks(row, col, board, shouldShow) {
    let startPeg = board[row][col];

    startPeg.possibleLinks =
      startPeg.possibleLinks || getPossibleLinks(row, col);

    for (let link of startPeg.possibleLinks) {
      let endPeg = board[link.row][link.col];
      if (shouldShow) {
        startPeg.isFirstPeg = "first-peg";
        if (canLink({ row, col }, link)) {
          endPeg.isPossibleLink = "possible-link";
        }
      } else {
        startPeg.isFirstPeg = "";
        endPeg.isPossibleLink = "";
      }
    }

    return board;
  }

  function renderLinks(links, row, col, color) {
    return Array.from(links).map((link) => {
      let className = "twixt-link " + color;
      if (link.row > row) {
        let colDiff = link.col - col;
        switch (colDiff) {
          case 2:
            className += " four-oclock";
            break;
          case 1:
            className += " five-oclock";
            break;
          case -1:
            className += " seven-oclock";
            break;
          case -2:
            className += " eight-oclock";
            break;
          default:
            console.log("bad link", link);
            return null;
        }
        return (
          <div
            key={`(${col}, ${row})->(${link.col}, ${link.row})`}
            className={className}
          >
            .
          </div>
        );
      } else {
        return null;
      }
    });
  }

  function getHoleClassName(hole, i, j) {
    let classNames = [
      "twixt-hole",
      hole.color,
      hole.isPossibleLink,
      hole.isFirstPeg,
    ];
    if (isPossiblePeg(hole, i, j)) {
      classNames.push("possible-peg");
    }
    return classNames.join(" ");
  }

  function isPossiblePeg(hole, row, col) {
    if (!isMyTurn()) {
      return false;
    }
    row = Number(row);
    col = Number(col);
    if (secondLinkClick) {
      return hole.isPossibleLink;
    } else if (isAcrossThreshold(row, col, false)) {
      return false;
    } else {
      return hole.color === "empty" || isMyPlayerColor(hole.color);
    }
  }

  function isAcrossThreshold(row, col, isCurrPlayerThreshold) {
    let currPlayer = isCurrPlayerThreshold
      ? isMyPlayerColor("red")
      : isMyPlayerColor("black");
    if (currPlayer) {
      return col === 0 || col === 23;
    } else {
      return row === 0 || row === 23;
    }
  }

  return (
    <div className="twixt-container">
      <div className="player-info">
        {shouldManageTurns && (
          <h3>It's {currentPlayer ? currentPlayer[0] : "no-one"}'s turn.</h3>
        )}
        <button onClick={toggleManageTurns}>
          {shouldManageTurns ? "Stop Turns" : "Manage Turns"}
        </button>
        {!shouldManageTurns && (
          <button onClick={switchPlayer}>Switch Player</button>
        )}
        <h3>You're playing {getMyPlayerColor()}.</h3>
      </div>
      <div className="twixt-board" onClick={handleHoleClick}>
        {board.map((row, i) =>
          row.map((hole, j) => (
            <div
              key={`(${j},${i})`}
              id={`coords-${j}-${i}`}
              data-row={i}
              data-col={j}
              className={getHoleClassName(hole, i, j)}
            >
              <div className="twixt-peg">.</div>
              {renderLinks(hole.links, i, j, hole.color)}
            </div>
          ))
        )}
        <div className="threshold black top">.</div>
        <div className="threshold red left">.</div>
        <div className="threshold black bottom">.</div>
        <div className="threshold red right">.</div>
      </div>
      {isMyTurn() && <button onClick={resetBoard}>Reset Board</button>}
      {shouldManageTurns && isMyTurn() && (
        <button onClick={endTurn}>End Turn</button>
      )}
      {actionsThisTurn.length > 0 && (
        <button onClick={undoLastAction}>Undo</button>
      )}
      {secondLinkClick && (
        <button className={"cancel"} onClick={() => makeMove(exitLinkMode())}>
          Cancel Link
        </button>
      )}
    </div>
  );
};

export default TwixtBoard;
