import withGameManager from "./GameManager";
import TwixtBoard from "./TwixtBoard";

function getInitialBoard() {
  let b = Array(24);
  for (let i = 0; i < b.length; i++) {
    let row = Array(24);
    for (let j = 0; j < row.length; j++) {
      row[j] = { color: "empty", links: [], isPossibleLink: "" };
    }
    b[i] = row;
  }
  return b;
}

const Twixt = withGameManager(TwixtBoard, ["red", "black"], getInitialBoard);

export default Twixt;
