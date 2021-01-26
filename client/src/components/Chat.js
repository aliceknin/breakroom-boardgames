import React, { useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import "../styles/Chat.scss";

const Chat = ({ socket, roomName, existingChat }) => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  function handleMessageChange(e) {
    setCurrentMessage(e.target.value);
  }

  function handleSendMessage(e) {
    // another place for input validation!
    e.preventDefault();
    currentMessage.length > 0 &&
      socket.emit("msg", {
        msg: currentMessage,
        roomName,
        from: socket.id,
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
    <div className="chat">
      <div className="messages">
        {/*this extra div allows us to automatically have the 
           messages scrolled to the bottom using flexbox*/}
        <div>
          {messages.map((msg) => (
            <ChatMessage key={Math.random()} msg={msg} id={socket.id} />
          ))}
        </div>
      </div>
      <ChatInput
        value={currentMessage}
        onChange={handleMessageChange}
        onSubmit={handleSendMessage}
      />
      <button className="clear-chat" onClick={clearServerChat}>
        Clear Chat
      </button>
    </div>
  );
};

export default Chat;
