import React, { useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

const Chat = ({ socket, roomName, existingChat }) => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  function handleMessageChange(e) {
    setCurrentMessage(e.target.value);
  }

  function handleSendMessage(e) {
    e.preventDefault();
    socket.emit("msg", {
      msg: currentMessage,
      roomName,
    });
    setCurrentMessage("");
  }

  function clearServerChat() {
    socket.emit("clear chat", roomName);
  }

  useEffect(() => {
    setMessages((msgs) => existingChat.concat(msgs));

    function receiveMessage(msg) {
      setMessages((msgs) => msgs.concat(msg));
    }

    function clearLocalChat() {
      setMessages([]);
    }

    socket.on("broadcast", receiveMessage);
    socket.on("clear chat", clearLocalChat);

    return () => {
      socket.off("broadcast", receiveMessage);
      socket.off("clear chat", clearLocalChat);
    };
  }, [socket, existingChat]);

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
      <button onClick={clearServerChat}>Clear Chat</button>
    </div>
  );
};

export default Chat;
