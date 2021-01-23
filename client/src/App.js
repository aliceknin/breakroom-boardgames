import { useState } from "react";
import SocketClient from "./components/SocketClient";

import logo from "./logo.svg";
import "./App.css";

function App() {
  const [connected, setConnected] = useState(false);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          {connected && <SocketClient />}
          <button onClick={() => setConnected((c) => !c)}>
            {connected ? "Disconnect" : "Connect to Server"}
          </button>
        </div>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
