import React from "react";

const LoadingWrapper = ({ isLoading, children }) => {
  return isLoading ? <div>Loading...</div> : children;
};

export default LoadingWrapper;
