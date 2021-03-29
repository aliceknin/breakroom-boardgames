import React from "react";

const TwixtLink = ({ link, row, col, color }) => {
  let className = "twixt-link " + color;
  if (link.row > row) {
    let colDiff = link.col - col;
    switch (colDiff) {
      case 2:
        className += " four-oclock";
        break;
      case 1:
        className += " five-oclock";
        break;
      case -1:
        className += " seven-oclock";
        break;
      case -2:
        className += " eight-oclock";
        break;
      default:
        console.log("bad link", link);
        return null;
    }
    return <div className={className}>.</div>;
  } else {
    return null;
  }
};

export default TwixtLink;
