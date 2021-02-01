import React, { useEffect, useState } from "react";
import "../styles/Twixt.scss";

const TwixtBoard = ({ socket, roomName, gameState, clearGameState }) => {
  const [board, setBoard] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(true);
  const [linkMode, setLinkMode] = useState(false);
  const [firstPeg, setFirstPeg] = useState(null);
  const [secondLinkClick, setSecondLinkClick] = useState(false);

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
    socket.emit("game joined", roomName);
  }, [socket, roomName]);

  useEffect(() => {
    function gameStateChange(newState) {
      console.log("the game's state changed!");
      newState && setBoard(newState);
      // setCurrentPlayer((p) => !p);
    }

    console.log("registering game listeners...");
    socket.on("game state change", gameStateChange);

    return () => {
      console.log("removing game listeners...");
      socket.off("game state change", gameStateChange);
    };
  }, [socket]);

  function handleHoleClick(e) {
    let hole = e.target.closest(".twixt-hole");
    if (!hole) {
      console.log("misclick, yo");
      return;
    }

    let b = [...board];
    let row = Number(hole.dataset.row);
    let col = Number(hole.dataset.col);

    if (linkMode) {
      handleLinkMode(b, row, col);
    } else {
      handlePegMode(b, row, col);
    }
  }

  function handleLinkMode(b, row, col) {
    if (secondLinkClick) {
      if (canLink(firstPeg, { row, col })) {
        b = exitLinkMode(b);
        b = createLink(b, firstPeg, { row, col });
        makeMove(b);
      } else {
        console.log("couldn't link", firstPeg, "to", { row, col });
      }
    } else {
      // if ((hole.color === "red") === currentPlayer) {
      console.log(`set first peg: (${row},${col})`);
      setFirstPeg({ row, col });
      setSecondLinkClick(true);
      setBoard(togglePossibleLinks(row, col, b, true));
      // }
    }
  }

  function handlePegMode(b, row, col) {
    let color = b[row][col].color;
    if (color === "red" || color === "black") {
      return;
    }
    b[row][col].color = currentPlayer ? "red" : "black";
    makeMove(b);
  }

  function makeMove(newState) {
    setBoard(newState);
    socket.emit("move", { newState, roomName });
    // setCurrentPlayer((p) => !p);
  }

  function createLink(b, startPegCoords, endPegCoords) {
    b[startPegCoords.row][startPegCoords.col].links.push(endPegCoords);
    b[endPegCoords.row][endPegCoords.col].links.push(startPegCoords);
    return b;
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
    let b = Array(24);
    for (let i = 0; i < b.length; i++) {
      let row = Array(24);
      for (let j = 0; j < row.length; j++) {
        row[j] = { color: "empty", links: [], isPossibleLink: "" };
      }
      b[i] = row;
    }
    setBoard(b);
    socket.emit("move", { newState: b, roomName });
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
      if (link.row > 0 && link.row < 24 && link.col >= 0 && link.col < 24) {
        possibleLinks.push(link);
      }
    }

    return possibleLinks;
  }

  function hasLink(links, endPegCoords) {
    for (let link of links) {
      if (link.row === endPegCoords.row && link.col === endPegCoords.col) {
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
          hasLinkWhere(minX - 1, midY, (x, y) => {
            return x === maxX && y === minY;
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
          hasLinkWhere(minX - 1, midY, (x, y) => {
            return x === maxX && y === maxY;
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
          hasLinkWhere(midX, minY - 1, (x, y) => {
            return x === minX && y === maxY;
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
          hasLinkWhere(midX, minY - 1, (x, y) => {
            return x === maxX && y === maxY;
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
      startPeg.color === endPeg.color &&
      !hasLink(startPeg.links, endPegCoords) &&
      hasLink(startPeg.possibleLinks, endPegCoords) &&
      !linkIsBlocked(startPegCoords, endPegCoords)
    );
  }

  function togglePossibleLinks(row, col, board, shouldShow) {
    let startPeg = board[row][col];

    startPeg.possibleLinks =
      startPeg.possibleLinks || getPossibleLinks(row, col);

    for (let link of startPeg.possibleLinks) {
      let endPeg = board[link.row][link.col];
      if (shouldShow) {
        if (canLink({ row, col }, link)) {
          setPossibleLink(endPeg);
        }
      } else {
        endPeg.isPossibleLink && unSetPossibleLink(endPeg);
      }
    }

    return board;
  }

  function setPossibleLink(peg) {
    peg.isPossibleLink = "possible-link";
  }

  function unSetPossibleLink(peg) {
    peg.isPossibleLink = "";
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

  return (
    <div className="twixt-container">
      <div className="twixt-board" onClick={handleHoleClick}>
        {board.map((row, i) =>
          row.map((hole, j) => (
            <div
              key={`(${j},${i})`}
              id={`coords-${j}-${i}`}
              data-row={i}
              data-col={j}
              className={"twixt-hole " + hole.color + " " + hole.isPossibleLink}
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
      <button onClick={() => setCurrentPlayer((p) => !p)}>
        {currentPlayer ? "Black" : "Red"}
      </button>
      <button onClick={resetBoard}>Reset Board</button>
      <button onClick={() => setLinkMode((m) => !m)} disabled={secondLinkClick}>
        {linkMode ? "Peg Mode" : "Link Mode"}
      </button>
      {secondLinkClick && (
        <button onClick={() => setBoard(exitLinkMode())}>Cancel Link</button>
      )}
    </div>
  );
};

export default TwixtBoard;
