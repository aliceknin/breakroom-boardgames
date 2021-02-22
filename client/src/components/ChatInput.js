import React, { useContext } from "react";
import RoomContext from "../contexts/RoomContext";

const ChatInput = (props) => {
  const { connected } = useContext(RoomContext);

  return (
    <form className="chat-form" onSubmit={props.onSubmit}>
      <input
        type="text"
        aria-label="Room chat"
        placeholder="Say something to the room!"
        value={props.value}
        onChange={props.onChange}
        disabled={!connected}
      />
      <button type="submit" disabled={!connected}>
        Send
      </button>
    </form>
  );
};

export default ChatInput;
