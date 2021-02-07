import React from "react";

const TurnInfo = ({
  shouldManageTurns,
  toggleManageTurns,
  currentPlayer,
  switchPlayer,
  getMyPlayerColor,
  winner,
}) => {
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
      {winner && (
        <h2>
          {winner[0]} won! Go {winner[1]}!
        </h2>
      )}
    </div>
  );
};

export default TurnInfo;
