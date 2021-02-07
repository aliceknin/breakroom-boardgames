import React, { useState } from "react";
import TwixtHole from "./TwixtHole";
import hasPlayerWon from "../utils/TwixtWinCondition";
import {
  getPossibleLinks,
  linkEquals,
  removeLink,
  canLink,
  isAcrossThreshold,
} from "../utils/TwixtLinkUtils";
import "../styles/Twixt.scss";

const TwixtBoard = ({
  board,
  getInitialBoard,
  makeMove,
  isMyTurn,
  getMyPlayerColor,
  isMyPlayerColor,
  onPlayerWin,
  winner,
  setWinner,
  shouldManageTurns,
  endTurn,
  actionsThisTurn,
  setActionsThisTurn,
}) => {
  const [linkMode, setLinkMode] = useState(false);
  const [firstPeg, setFirstPeg] = useState(null);
  const [secondLinkClick, setSecondLinkClick] = useState(false);

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
      if (!isAcrossThreshold(row, col, getMyPlayerColor(), false)) {
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
      if (singleLink(b, row, col)) {
        let link = b[firstPeg.row][firstPeg.col].legalLinks.pop();
        completeLink(b, link.row, link.col);
      } else if (canLink(firstPeg, { row, col }, b)) {
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

  function singleLink(b, row, col) {
    let startPeg = b[firstPeg.row][firstPeg.col];
    return (
      linkEquals(firstPeg, { row, col }) &&
      startPeg.legalLinks &&
      startPeg.legalLinks.length === 1
    );
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

    if (hasPlayerWon(getMyPlayerColor(), b)) {
      onPlayerWin();
    }

    makeMove(b);
    setActionsThisTurn((a) =>
      a.concat({
        action: "link",
        startPegCoords: firstPeg,
        endPegCoords: { row, col },
      })
    );
  }

  function exitLinkMode(b) {
    b = b || board;
    if (firstPeg) {
      b = togglePossibleLinks(firstPeg.row, firstPeg.col, b, false);
    }
    setLinkMode(false);
    setSecondLinkClick(false);
    setFirstPeg(null);
    return b;
  }

  function resetBoard() {
    let prevBoard = [...board];
    prevBoard = linkMode ? exitLinkMode(prevBoard) : prevBoard;

    setWinner(null);
    makeMove(getInitialBoard());

    setActionsThisTurn((a) => a.concat({ action: "reset", prevBoard, winner }));
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
          setWinner(lastAction.winner);
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

  function togglePossibleLinks(row, col, board, shouldShow) {
    let startPeg = board[row][col];

    startPeg.possibleLinks =
      startPeg.possibleLinks || getPossibleLinks(row, col);
    startPeg.legalLinks = startPeg.legalLinks || [];

    for (let link of startPeg.possibleLinks) {
      let endPeg = board[link.row][link.col];
      if (shouldShow) {
        startPeg.isFirstPeg = "first-peg";
        if (canLink({ row, col }, link, board)) {
          endPeg.isPossibleLink = "possible-link";
          startPeg.legalLinks.push(link);
        }
      } else {
        startPeg.isFirstPeg = "";
        endPeg.isPossibleLink = "";
        startPeg.legalLinks = [];
      }
    }

    return board;
  }

  return (
    <div className="twixt-container">
      <div className="twixt-board" onClick={handleHoleClick}>
        {board.map((row, i) =>
          row.map(
            (hole, j) =>
              hole && (
                <TwixtHole
                  key={`(${j},${i})`}
                  hole={hole}
                  row={i}
                  col={j}
                  playerColor={getMyPlayerColor()}
                  isMyTurn={isMyTurn()}
                  secondLinkClick={secondLinkClick}
                />
              )
          )
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
    </div>
  );
};

export default TwixtBoard;
