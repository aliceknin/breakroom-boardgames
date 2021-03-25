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

const TwixtRules = (
  <div>
    <h2>Twixt Rules</h2>
    <p>One day, I will actually add rules to this.</p>
  </div>
);

const Twixt = withGameManager(
  TwixtBoard,
  "Twixt",
  ["red", "black"],
  TwixtRules,
  getInitialBoard
);

export default Twixt;
