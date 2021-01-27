import React, { useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import "../styles/Chat.scss";

const Chat = ({ socket, roomName, existingChat, clearExistingChat }) => {
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
        from: socket.userName,
      });
    setCurrentMessage("");
  }

  function clearServerChat() {
    socket.emit("clear chat", roomName);
  }

  useEffect(() => {
    console.log("checking for new chat history");

    if (existingChat.length > 0) {
      console.log("adding new chat history");
      setMessages(existingChat);
      // .concat(
      //   { msg: "And that's what you missed on Glee.", serverUtil: true },
      //   // msgs,
      //   { msg: "Enjoy the ride!", serverUtil: true }
      // )
      clearExistingChat();
    }
  }, [existingChat, clearExistingChat]);

  useEffect(() => {
    if (!socket) {
      console.log("no socket on which to set listeners :(");
      return () => {};
    }
    console.log("registering listeners...");
    function receiveMessage(msg) {
      setMessages((msgs) => msgs.concat(msg));
    }

    function clearLocalChat() {
      setMessages([]);
      clearExistingChat();
    }

    socket.on("broadcast", receiveMessage);
    socket.on("clear chat", clearLocalChat);

    return () => {
      console.log("removing listeners...");
      socket.off("broadcast", receiveMessage);
      socket.off("clear chat", clearLocalChat);
    };
  }, [socket, clearExistingChat]);

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
      <button className="clear-chat" onClick={clearServerChat}>
        Clear Chat
      </button>
    </div>
  );
};

export default Chat;
