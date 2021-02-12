import React from "react";

const TurnInfo = ({
  turnMode,
  toggleTurnMode,
  currentPlayer,
  switchPlayer,
  getMyPlayerColor,
  winner,
}) => {
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
        <button onClick={toggleTurnMode}>
          {turnMode ? "Stop Turns" : "Manage Turns"}
        </button>
        {!turnMode && <button onClick={switchPlayer}>Switch Player</button>}
        <h3>{myRole()}.</h3>
      </div>
    </div>
  );
};

export default TurnInfo;
