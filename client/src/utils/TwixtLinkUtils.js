export function getPossibleLinks(row, col) {
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
    if (link.row >= 0 && link.row < 24 && link.col >= 0 && link.col < 24) {
      possibleLinks.push(link);
    }
  }

  return possibleLinks;
}

export function linkEquals(firstLink, secondLink) {
  return firstLink.row === secondLink.row && firstLink.col === secondLink.col;
}

export function removeLink(links, endPegCoords) {
  for (let i = 0; i < links.length; i++) {
    if (linkEquals(links[i], endPegCoords)) {
      return links.splice(i, 1);
    }
  }

  return false;
}

function hasLink(links, endPegCoords) {
  for (let link of links) {
    if (linkEquals(link, endPegCoords)) {
      return true;
    }
  }

  return false;
}

function hasLinkWhere(board, x, y, xyConditions) {
  let links = board[y][x].links;

  for (let link of links) {
    if (xyConditions(link.col, link.row)) {
      return true;
    }
  }

  return false;
}

function linkIsBlocked(startPegCoords, endPegCoords, b) {
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
        hasLinkWhere(b, maxX, minY, (x, y) => {
          return x < maxX && y > minY;
        }) ||
        hasLinkWhere(b, minX, midY, (x, y) => {
          return x > minX && y <= maxY;
        }) ||
        hasLinkWhere(b, maxX, midY, (x, y) => {
          return x < maxX && y >= minY;
        }) ||
        hasLinkWhere(b, minX, maxY, (x, y) => {
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
        hasLinkWhere(b, maxX, maxY, (x, y) => {
          return x < maxX && y < maxY;
        }) ||
        hasLinkWhere(b, minX, midY, (x, y) => {
          return x > minX && y >= minY;
        }) ||
        hasLinkWhere(b, maxX, midY, (x, y) => {
          return x < maxX && y <= maxY;
        }) ||
        hasLinkWhere(b, minX, minY, (x, y) => {
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
        hasLinkWhere(b, minX, maxY, (x, y) => {
          return x > minX && y < maxY;
        }) ||
        hasLinkWhere(b, midX, minY, (x, y) => {
          return x <= maxX && y > minY;
        }) ||
        hasLinkWhere(b, midX, maxY, (x, y) => {
          return x >= minX && y < maxY;
        }) ||
        hasLinkWhere(b, maxX, minY, (x, y) => {
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
        hasLinkWhere(b, maxX, maxY, (x, y) => {
          return x < maxX && y < maxY;
        }) ||
        hasLinkWhere(b, midX, minY, (x, y) => {
          return x >= minX && y > minY;
        }) ||
        hasLinkWhere(b, midX, maxY, (x, y) => {
          return x <= maxX && y < maxY;
        }) ||
        hasLinkWhere(b, minX, minY, (x, y) => {
          return x > minX && y > minY;
        })
      );
    }
  }
}

export function canLink(startPegCoords, endPegCoords, b) {
  let startPeg = b[startPegCoords.row][startPegCoords.col];
  let endPeg = b[endPegCoords.row][endPegCoords.col];

  startPeg.possibleLinks =
    startPeg.possibleLinks ||
    getPossibleLinks(startPegCoords.row, startPegCoords.col);

  return (
    (startPeg.isFirstPeg && endPeg.isPossibleLink) ||
    (startPeg.color === endPeg.color &&
      !hasLink(startPeg.links, endPegCoords) &&
      hasLink(startPeg.possibleLinks, endPegCoords) &&
      !linkIsBlocked(startPegCoords, endPegCoords, b))
  );
}

export function isAcrossThreshold(
  row,
  col,
  playerColor,
  isCurrPlayerThreshold
) {
  let currPlayer = isCurrPlayerThreshold
    ? playerColor === "red"
    : playerColor === "black";
  if (currPlayer) {
    return col === 0 || col === 23;
  } else {
    return row === 0 || row === 23;
  }
}
