import React, { useContext } from "react";
import RoomContext from "../contexts/RoomContext";

const TurnInfo = ({
  turnMode,
  toggleTurnMode,
  currentPlayer,
  singlePlayer,
  switchPlayer,
  getMyPlayerColor,
  roleDisplayName,
  winner,
}) => {
  const { connected } = useContext(RoomContext);

  function myRole() {
    let role = getMyPlayerColor();

    return role === "spectator"
      ? `You're a ${role}.`
      : `You're playing ${role}.`;
  }

  function whoseTurnIsIt() {
    let currPlayer;
    if (currentPlayer) {
      if (currentPlayer[0] === getMyPlayerColor()) {
        return "your turn!";
      } else {
        currPlayer = currentPlayer[0];
      }
    } else {
      currPlayer = "no-one";
    }
    return `${currPlayer}'s turn.`;
  }

  return (
    <div className="turn-info">
      <div className="player-info">
        {turnMode && <h3>It's {whoseTurnIsIt()}</h3>}
        <div
          className="info-popup-group"
          tabIndex={!turnMode && singlePlayer ? "0" : ""}
        >
          <button
            onClick={toggleTurnMode}
            disabled={!connected || (!turnMode && singlePlayer)}
          >
            {turnMode ? "Stop Game" : "Start Game"}
          </button>
          {!turnMode && singlePlayer && (
            <p className="info-popup">
              You're the only one here at the moment. Play around with the board
              for now, and when someone else arrives, you can start a game!
            </p>
          )}
        </div>
        {!turnMode && (
          <button
            className="switch-player"
            onClick={switchPlayer}
            disabled={!connected}
          >
            {roleDisplayName === "color" && (
              <span
                className={"player-color-indicator " + getMyPlayerColor()}
              ></span>
            )}
            <span>
              Switch <br />
              {roleDisplayName}
            </span>
          </button>
        )}
        <h3>
          {roleDisplayName === "color" && !turnMode ? "Free Play!" : myRole()}
        </h3>
      </div>
    </div>
  );
};

export default TurnInfo;
