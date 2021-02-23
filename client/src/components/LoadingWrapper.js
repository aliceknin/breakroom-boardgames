import React from "react";
import "../styles/LoadingWrapper.scss";

const LoadingWrapper = ({ isLoading, children }) => {
  return isLoading ? (
    <div className="loading">
      <p>
        Loading
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </p>
    </div>
  ) : (
    children
  );
};

export default LoadingWrapper;
