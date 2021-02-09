import React from "react";

const TurnInfo = ({
  shouldManageTurns,
  toggleManageTurns,
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
        {shouldManageTurns && (
          <h3>It's {currentPlayer ? currentPlayer[0] : "no-one"}'s turn.</h3>
        )}
        <button onClick={toggleManageTurns}>
          {shouldManageTurns ? "Stop Turns" : "Manage Turns"}
        </button>
        {!shouldManageTurns && (
          <button onClick={switchPlayer}>Switch Player</button>
        )}
        <h3>{myRole()}.</h3>
      </div>
    </div>
  );
};

export default TurnInfo;
