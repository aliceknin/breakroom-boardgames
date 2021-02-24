import React from "react";
import "../styles/LoadingWrapper.scss";

const LoadingWrapper = ({ isLoading, hasFailed, errorMessage, children }) => {
  return isLoading ? (
    <div className="wrapper loading">
      <p>
        Loading
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </p>
    </div>
  ) : hasFailed ? (
    <div className="wrapper failed">
      <p>
        {errorMessage
          ? errorMessage
          : "Something went wrong. Try restarting the server?"}
      </p>
    </div>
  ) : (
    children
  );
};

export default LoadingWrapper;
