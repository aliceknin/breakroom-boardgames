import React, { useContext, useState } from "react";
import TwixtHole from "./TwixtHole";
import hasPlayerWon from "../utils/TwixtWinCondition";
import {
  getPossibleLinks,
  linkEquals,
  removeLink,
  canLink,
  canStartLink,
  canPlacePeg,
} from "../utils/TwixtLinkUtils";
import "../styles/Twixt.scss";
import Overlay from "./Overlay";
import RoomContext from "../contexts/RoomContext";
import BannerAlert from "./BannerAlert";

const TwixtBoard = ({
  board,
  getInitialBoard,
  makeMove,
  isMyTurn,
  getMyPlayerColor,
  onPlayerWin,
  winner,
  broadcastWinner,
  turnMode,
  endTurn,
  actionsThisTurn,
  setActionsThisTurn,
}) => {
  const [linkMode, setLinkMode] = useState(false);
  const [firstPeg, setFirstPeg] = useState(null);
  const [havePlacedPeg, setHavePlacedPeg] = useState(false);
  const [showPegAlert, setShowPegAlert] = useState(false);
  const { connected } = useContext(RoomContext);

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

    turnMode && havePlacedPeg && setShowPegAlert(true);

    if (linkMode) {
      console.log("link mode");
      handleLinkMode(b, row, col);
    } else {
      console.log("peg mode");
      handlePegMode(b, row, col, hole);
    }
  }

  function handlePegMode(b, row, col, hole) {
    let playerColor = getMyPlayerColor();
    if (canPlacePeg(hole, row, col, playerColor, turnMode, havePlacedPeg)) {
      hole.color = playerColor;
      makeMove(b);
      turnMode && setHavePlacedPeg(true);
      setActionsThisTurn((a) => a.concat({ action: "peg", row, col }));
    } else if (canStartLink(hole, playerColor)) {
      console.log("switching to link mode");
      startLink(b, row, col);
    }
  }

  function handleLinkMode(b, row, col) {
    if (singleLink(b, row, col)) {
      let link = b[firstPeg.row][firstPeg.col].legalLinks.pop();
      completeLink(b, link.row, link.col);
    } else if (canLink(firstPeg, { row, col }, b)) {
      completeLink(b, row, col);
    } else {
      console.log("couldn't link", firstPeg, "to", { row, col });
      makeMove(exitLinkMode(b));
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
    setLinkMode(true);
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
    setFirstPeg(null);
    return b;
  }

  function resetBoard() {
    let prevBoard = [...board];
    prevBoard = linkMode ? exitLinkMode(prevBoard) : prevBoard;

    broadcastWinner(null);
    makeMove(getInitialBoard());
    turnMode && setHavePlacedPeg(false);

    setActionsThisTurn((a) =>
      a.concat({ action: "reset", prevBoard, winner, havePlacedPeg })
    );
  }

  function endMyTurn() {
    setHavePlacedPeg(false);
    linkMode && makeMove(exitLinkMode());
    endTurn();
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
          turnMode && setHavePlacedPeg(false);
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
          broadcastWinner(lastAction.winner);
          turnMode && setHavePlacedPeg(lastAction.havePlacedPeg);
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

  const disabled = !isMyTurn() || !connected;
  const undoDisabled = actionsThisTurn.length === 0 || !connected;

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
                  canMakeMove={isMyTurn() && connected}
                  linkMode={linkMode}
                  turns={turnMode}
                  placedPeg={havePlacedPeg}
                />
              )
          )
        )}
        <div className="threshold black top">.</div>
        <div className="threshold red left">.</div>
        <div className="threshold black bottom">.</div>
        <div className="threshold red right">.</div>
        {winner && (
          <Overlay className="win-message">
            <h2>
              {winner[0]} won!
              <br />
              Go {winner[1]}!
            </h2>
          </Overlay>
        )}
      </div>
      <div className="buttons-container">
        <button onClick={resetBoard} disabled={disabled}>
          Reset Board
        </button>
        <button onClick={undoLastAction} disabled={undoDisabled}>
          Undo
        </button>
        {turnMode && (
          <button onClick={endMyTurn} disabled={disabled}>
            End Turn
          </button>
        )}
      </div>
      {showPegAlert && (
        <BannerAlert
          className="peg-alert"
          onClose={() => setShowPegAlert(false)}
          duration="6000"
        >
          You've placed your peg already, but you can still make as many links
          as you can.
        </BannerAlert>
      )}
    </div>
  );
};

export default TwixtBoard;
