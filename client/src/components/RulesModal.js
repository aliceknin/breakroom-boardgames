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
      {content}
    </ReactModal>
  );
};

export default RulesModal;
