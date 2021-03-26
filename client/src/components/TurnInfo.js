import React, { useContext } from "react";
import RoomContext from "../contexts/RoomContext";

const TurnInfo = ({
  turnMode,
  toggleTurnMode,
  currentPlayer,
  singlePlayer,
  switchPlayer,
  getMyPlayerColor,
  winner,
}) => {
  const { connected } = useContext(RoomContext);

  function myRole() {
    let role = getMyPlayerColor();

    return role === "spectator" ? `You're a ${role}` : `You're playing ${role}`;
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
        <div className="info-popup-group" tabIndex="0">
          <button
            onClick={toggleTurnMode}
            disabled={!connected || (!turnMode && singlePlayer)}
          >
            {turnMode ? "Stop Turns" : "Manage Turns"}
          </button>
          {!turnMode && singlePlayer && (
            <p className="info-popup">
              You're the only one here at the moment. Play around with the board
              for now, and when someone else arrives, you can start a game with
              managed turns.
            </p>
          )}
        </div>
        {!turnMode && (
          <button onClick={switchPlayer} disabled={!connected}>
            Switch Player
          </button>
        )}
        <h3>{myRole()}.</h3>
      </div>
    </div>
  );
};

export default TurnInfo;
