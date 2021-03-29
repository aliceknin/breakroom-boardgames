import withGameManager from "./GameManager";
import TwixtBoard from "./TwixtBoard";
import placeFirstPeg from "../images/place-first-peg.png";
import placeSecondPeg from "../images/place-second-peg.png";
import startLink from "../images/start-link.png";
import completeLink from "../images/complete-link.png";

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
  <div className="rules">
    <h2>Twixt Rules</h2>
    <h3>Objective</h3>
    <p>
      Create an unbroken path of pegs and links across the board, crossing both
      of your color's thresholds.
    </p>
    <h3>Gameplay</h3>
    <ul>
      {/* <li>If the two players are significantly different in experience, the less experienced player should go first. Otherwise flip a coin.</li> */}
      <li>
        On each turn, you may place exactly one peg and create as many links as
        you want.
      </li>
      <li>
        You can place a peg in any empty space except for those across the other
        color's threshold.
      </li>
      <li>You can only link pegs of your color.</li>
      <li>Links cannot cross any other link.</li>
    </ul>
    <h3>Creating Links</h3>
    <ol className="creating-links">
      <li>Click an empty hole to place a peg there.</li>
      <div className="img-wrapper">
        <img src={placeFirstPeg} alt="Place the first peg." />
      </div>
      <li>
        Place another peg in a hole 2 spaces away in one direction and 1 space
        away in the other (an L shape, like a knight's move in chess).
      </li>
      <div className="img-wrapper">
        <img src={placeSecondPeg} alt="Place the second peg." />
      </div>
      <li>
        Click either one of the pegs to start a link. That peg will turn
        turquoise, and all the pegs that can link to it will turn purple.
      </li>
      <div className="img-wrapper">
        <img src={startLink} alt="Start the link." />
      </div>
      <li>
        Click on the peg you want to link to the first one to complete the link.
      </li>
      <div className="img-wrapper">
        <img src={completeLink} alt="Complete the link." />
      </div>
      <p className="note">
        If there is only one peg that can be linked to this one, a click on
        either peg will create the link. This means you could start and complete
        the link by clicking on the same peg.
      </p>
    </ol>
  </div>
);

const Twixt = withGameManager(
  TwixtBoard,
  "Twixt",
  ["red", "black"],
  TwixtRules,
  getInitialBoard,
  "color"
);

export default Twixt;
