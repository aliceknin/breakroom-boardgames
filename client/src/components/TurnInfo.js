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

  return (
    <div className="turn-info">
      <div className="player-info">
        {turnMode && (
          <h3>It's {currentPlayer ? currentPlayer[0] : "no-one"}'s turn.</h3>
        )}
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
