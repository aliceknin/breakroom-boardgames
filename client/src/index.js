import React from "react";
import ReactDOM from "react-dom";
import ReactModal from "react-modal";
import "./index.css";
import RouterContainer from "./containers/RouterContainer";
import reportWebVitals from "./reportWebVitals";

// eslint-disable-next-line
import focusVisible from "focus-visible";

ReactModal.setAppElement("#root");
ReactDOM.render(
  <React.StrictMode>
    <RouterContainer />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
