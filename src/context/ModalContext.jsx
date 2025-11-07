import React, { createContext, useContext, useCallback, useState } from 'react';

const ModalContext = createContext();

export const ModalTypes = {
  TRANSFER: 'transfer',
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  CONFIRM: 'confirm',
  ALERT: 'alert',
  CUSTOM: 'custom',
};

export const ModalProvider = ({ children }) => {
  const [modalStack, setModalStack] = useState([]);

  const openModal = useCallback((config) => {
    const modalId = `modal_${Date.now()}`;
    setModalStack(prev => [...prev, { ...config, id: modalId }]);
    return modalId;
  }, []);

  const closeModal = useCallback((modalId) => {
    setModalStack(prev => prev.filter(modal => modal.id !== modalId));
  }, []);

  const closeAllModals = useCallback(() => {
    setModalStack([]);
  }, []);

  const updateModal = useCallback((modalId, updates) => {
    setModalStack(prev => prev.map(modal => 
      modal.id === modalId ? { ...modal, ...updates } : modal
    ));
  }, []);

  const value = {
    modalStack,
    openModal,
    closeModal,
    closeAllModals,
    updateModal,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};