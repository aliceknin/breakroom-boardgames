import React from "react";
import ReactModal from "react-modal";
import "../styles/Modal.scss";

const RulesModal = ({ isOpen, onHide, content }) => {
  return (
    <ReactModal
      isOpen={isOpen}
      contentLabel="Rules Modal"
      onRequestClose={onHide}
      className="modal"
      closeTimeoutMS={200}
    >
      <button className="close" onClick={onHide}>
        <i className="close"></i>
      </button>
      {content}
    </ReactModal>
  );
};

export default RulesModal;
