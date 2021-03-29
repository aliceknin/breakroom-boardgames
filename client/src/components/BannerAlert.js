import React, { useState, useEffect } from "react";
import "../styles/BannerAlert.scss";

const BannerAlert = ({
  className = "",
  onClose,
  duration = 2000,
  children,
  refresh,
}) => {
  const [closing, setClosing] = useState(false);
  const [fadeTimeout, setFadeTimeout] = useState(null);
  const [closeTimeout, setCloseTimeout] = useState(null);

  useEffect(() => {
    const fadeTimeoutID = setTimeout(() => setClosing(true), duration - 500);
    setFadeTimeout(fadeTimeoutID);

    const closeTimeoutID = setTimeout(onClose, duration);
    setCloseTimeout(closeTimeoutID);

    refresh && console.log(`refresh: ${refresh} timeoutID ${closeTimeoutID}`);

    return () => {
      clearTimeout(fadeTimeoutID);
      clearTimeout(closeTimeoutID);
    };
  }, [onClose, duration, refresh]);

  function closeBannerAlert() {
    clearTimeout(fadeTimeout);
    clearTimeout(closeTimeout);
    setCloseTimeout(null);
    setFadeTimeout(null);
    onClose();
  }

  return (
    <div className={`banner-alert ${closing ? "closing" : ""} ${className}`}>
      <div className="banner-alert-content">{children}</div>
      <button className="close" onClick={closeBannerAlert}>
        <i className="close"></i>
      </button>
    </div>
  );
};

export default BannerAlert;
