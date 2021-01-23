import { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";

const ENDPOINT = "http://localhost:4005";

const SocketClient = () => {
  const [response, setResponse] = useState("");
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    console.log("trying to connect...");
    const socket =
      process.env.NODE_ENV === "production"
        ? socketIOClient()
        : socketIOClient(ENDPOINT);

    socket.on("count", (data) => {
      setResponse(data);
    });

    socket.on("user joined", (data) => {
      console.log("a user joined!");
      setUserCount(data);
    });

    socket.on("user left", (data) => {
      console.log("a user left.");
      setUserCount(data);
    });

    return () => {
      console.log("disconnecting");
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <p>
        There {userCount === 1 ? "is" : "are"} {userCount} user
        {userCount !== 1 && "s"} connected right now.
      </p>
      <p>
        It's been {response} second{response !== 1 && "s"} since I connected.
      </p>
    </div>
  );
};

export default SocketClient;
