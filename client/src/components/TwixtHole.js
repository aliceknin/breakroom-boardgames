import React from "react";
import TwixtLink from "./TwixtLink";
import { isAcrossThreshold } from "../utils/TwixtLinkUtils";

const TwixtHole = (props) => {
  function getHoleClassName(hole, row, col) {
    let classNames = [
      "twixt-hole",
      hole.color,
      hole.isPossibleLink,
      hole.isFirstPeg,
    ];
    if (isPossiblePeg(hole, row, col)) {
      classNames.push("possible-peg");
    }
    return classNames.join(" ");
  }

  function isPossiblePeg(hole, row, col) {
    if (!props.isMyTurn) {
      return false;
    }
    row = Number(row);
    col = Number(col);
    if (props.secondLinkClick) {
      return hole.isPossibleLink;
    } else if (isAcrossThreshold(row, col, props.playerColor, false)) {
      return false;
    } else {
      return hole.color === "empty" || props.playerColor === hole.color;
    }
  }

  return (
    <div
      id={`coords-${props.col}-${props.row}`}
      data-row={props.row}
      data-col={props.col}
      className={getHoleClassName(props.hole, props.row, props.col)}
    >
      <div className="twixt-peg">.</div>
      {props.hole &&
        Array.from(props.hole.links).map((link) => (
          <TwixtLink
            key={`(${props.col}, ${props.row})->(${link.col}, ${link.row})`}
            link={link}
            row={props.row}
            col={props.col}
            color={props.hole.color}
          />
        ))}
    </div>
  );
};

export default TwixtHole;
