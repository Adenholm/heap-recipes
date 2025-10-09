import { createContext, useState, ReactNode } from 'react';

type ModalContextType = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  setModal: (header: string, component: ReactNode) => void;
  modalComponent: ReactNode | null;
  modalHeader: string;
};

const ModalContext = createContext<ModalContextType>({
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
  setModal: () => {},
  modalComponent: null,
  modalHeader: "",
});

const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalComponent, setModalComponent] = useState<ReactNode | null>(null);
  const [modalHeader, setModalHeader] = useState("");

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const setModal = (header: string, component: ReactNode) => {
    setModalHeader(header);
    setModalComponent(component);
  };

  const value = {
    isOpen,
    openModal,
    closeModal,
    setModal,
    modalComponent,
    modalHeader
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

export { ModalContext, ModalProvider };