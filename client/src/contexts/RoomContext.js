import { createContext } from "react";

const RoomContext = createContext({
  socket: null,
  roomName: "",
  connected: false,
});

RoomContext.displayName = "RoomContext";

export default RoomContext;
