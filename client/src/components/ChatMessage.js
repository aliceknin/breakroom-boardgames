import React from "react";

const ChatMessage = ({ msg, userName }) => {
  function getClassName(msg) {
    let className = "chat-message";
    if (msg.serverUtil) {
      className += " server-util";
    } else {
      className += " from-person";
    }
    if (msg.from === userName) {
      className += " from-me";
    }
    return className;
  }

  return (
    <div className={getClassName(msg)}>
      {msg.from && msg.firstFromSender && (
        <p className="username">{msg.from}</p>
      )}
      <p className="message">{msg.msg}</p>
    </div>
  );
};

export default ChatMessage;
