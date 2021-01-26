import React from "react";

const ChatMessage = ({ msg, id }) => {
  function getClassName(msg) {
    let className = "chat-message";
    if (msg.serverUtil) {
      className += " server-util";
    }
    if (msg.from === id) {
      className += " from-me";
    }
    return className;
  }

  return <p className={getClassName(msg)}>{msg.msg}</p>;
};

export default ChatMessage;
