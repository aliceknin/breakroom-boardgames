import React from "react";

const ChatInput = (props) => {
  return (
    <form onSubmit={props.onSubmit}>
      <input
        type="text"
        aria-label="Room chat"
        placeholder="Say something to the room!"
        value={props.value}
        onChange={props.onChange}
      />
      <button type="submit">Send</button>
    </form>
  );
};

export default ChatInput;
