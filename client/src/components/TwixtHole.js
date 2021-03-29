import React from "react";
import TwixtLink from "./TwixtLink";
import { canStartLink, canPlacePeg } from "../utils/TwixtLinkUtils";

const TwixtHole = (props) => {
  function getHoleClassName(hole, row, col) {
    let classNames = [
      "twixt-hole",
      hole.color,
      hole.isPossibleLink,
      hole.isFirstPeg,
    ];
    if (isPossiblePeg(hole, row, col, props.playerColor)) {
      classNames.push("possible-peg");
    }
    return classNames.join(" ");
  }

  function isPossiblePeg(hole, row, col, playerColor) {
    if (!props.canMakeMove) {
      return false;
    }
    row = Number(row);
    col = Number(col);
    if (props.linkMode) {
      return hole.isPossibleLink;
    } else {
      return (
        canStartLink(hole, playerColor) ||
        canPlacePeg(hole, row, col, playerColor, props.turns, props.placedPeg)
      );
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
