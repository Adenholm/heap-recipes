import ReactModal from 'react-modal';
import { ModalContext } from '../../context/modal.js';
import './style.css';
import { useContext } from 'react';
import style from './style.js';
// @ts-ignore: missing type declaration for SVG import
import closeIcon from '../../assets/images/close-black.svg';


ReactModal.setAppElement('#root');

const Modal = () => {
  const { isOpen, closeModal, modalComponent, modalHeader } = useContext(ModalContext);


  return (
    <ReactModal isOpen={isOpen} onRequestClose={closeModal} style={style}>
      <div className="modal-body">
        <section className="modal-header border-bottom">
          <h2>{modalHeader}</h2>
          <button type="button" className="modal-close" onClick={closeModal} aria-label="Close modal">
            <img src={closeIcon} alt="Close modal" />
          </button>
        </section>

        <section className="modal-content">{modalComponent}</section>
      </div>
    </ReactModal>
  );
};

export default Modal;