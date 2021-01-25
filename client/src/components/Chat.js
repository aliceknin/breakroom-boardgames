import React, { useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

const Chat = (props) => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  function handleMessageChange(e) {
    setCurrentMessage(e.target.value);
  }

  function handleSendMessage(e) {
    e.preventDefault();
    props.socket.emit("msg", {
      room: props.roomName,
      msg: currentMessage
    });
    setCurrentMessage("");
  }

  useEffect(() => {
    function receiveMessage(msg) {
      setMessages((msgs) => msgs.concat(msg));
    }

    props.socket.on("broadcast", receiveMessage);
  }, [props.socket]);

  return (
    <div>
      {messages.map((msg) => (
        <ChatMessage key={Math.random()} msg={msg} />
      ))}
      <ChatInput
        value={currentMessage}
        onChange={handleMessageChange}
        onSubmit={handleSendMessage}
      />
    </div>
  );
};

export default Chat;
