import React, { useContext, useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import RoomContext from "../contexts/RoomContext";
import "../styles/Chat.scss";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const { socket, roomName, connected } = useContext(RoomContext);

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
        from: socket.userName,
      });
    setCurrentMessage("");
  }

  function clearServerChat() {
    socket.emit("clear chat", roomName);
  }

  useEffect(() => {
    if (connected) {
      console.log("connected, joining chat");
      socket.emit("chat joined", roomName);
    }
  }, [socket, roomName, connected]);

  useEffect(() => {
    console.log("registering chat listeners...");
    function receiveMessage(msg) {
      setMessages((msgs) => msgs.concat(msg));
    }

    function replaceMessages(msgs) {
      setMessages(msgs);
      console.log("replacing messages");
    }

    function clearLocalChat() {
      setMessages([]);
    }

    socket.on("broadcast", receiveMessage);
    socket.on("replace msgs", replaceMessages);
    socket.on("clear chat", clearLocalChat);

    return () => {
      console.log("removing chat listeners...");
      socket.off("broadcast", receiveMessage);
      socket.off("replace msgs", replaceMessages);
      socket.off("clear chat", clearLocalChat);
    };
  }, [socket]);

  return (
    <div className="chat">
      <div className="messages">
        {/*this extra div allows us to automatically have the 
           messages scrolled to the bottom using flexbox*/}
        <div>
          {messages.map((msg) => (
            <ChatMessage
              key={Math.random()}
              msg={msg}
              userName={socket.userName}
            />
          ))}
        </div>
      </div>
      <ChatInput
        value={currentMessage}
        onChange={handleMessageChange}
        onSubmit={handleSendMessage}
      />
      <button
        className="clear-chat"
        onClick={clearServerChat}
        disabled={!connected}
      >
        Clear Chat
      </button>
    </div>
  );
};

export default Chat;
