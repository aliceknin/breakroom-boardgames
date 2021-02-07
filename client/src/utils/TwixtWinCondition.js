function getThresholdPegs(startPegs, colorIsRed, board) {
  let thresholdNum = startPegs ? 0 : 23;
  let thresholdPegs = [];

  for (let i = 1; i < 23; i++) {
    let pegCoords = colorIsRed
      ? { row: i, col: thresholdNum }
      : { row: thresholdNum, col: i };
    if (board[pegCoords.row][pegCoords.col].color !== "empty") {
      thresholdPegs.push(pegCoords);
    }
  }
  return thresholdPegs;
}

function isEndThresholdPeg(pegCoords, colorIsRed, board) {
  let isAcrossEndThreshold = colorIsRed
    ? pegCoords.col === 23
    : pegCoords.row === 23;
  let isPeg = board[pegCoords.row][pegCoords.col].color !== "empty";
  return isAcrossEndThreshold && isPeg;
}

function pathExistsFrom(startPegCoords, colorIsRed, board) {
  let visited = new Set();
  let stack = [startPegCoords];

  while (stack.length > 0) {
    let pegCoords = stack.pop();

    if (!visited.has(pegCoords)) {
      if (isEndThresholdPeg(pegCoords, colorIsRed, board)) {
        return true;
      } else {
        let peg = board[pegCoords.row][pegCoords.col];
        stack.push(...peg.links);
        visited.add(pegCoords);
      }
    }
  }

  return false;
}

function hasPlayerWon(color, board) {
  console.log("did we win yet?");
  let colorIsRed = color === "red";
  let startThresholdPegs = getThresholdPegs(true, colorIsRed, board);

  if (startThresholdPegs.length > 0) {
    let endThresholdPegs = getThresholdPegs(false, colorIsRed, board);

    if (endThresholdPegs.length > 0) {
      for (let i = 0; i < startThresholdPegs.length; i++) {
        if (pathExistsFrom(startThresholdPegs[i], colorIsRed, board)) {
          return true;
        }
      }
    }
  }

  return false;
}

export default hasPlayerWon;
