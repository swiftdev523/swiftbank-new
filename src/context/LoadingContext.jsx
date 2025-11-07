import React, { createContext, useContext, useState, useCallback } from 'react';

// Create Loading Context
const LoadingContext = createContext();

// Loading operations constants
export const LoadingOperations = {
  SIGN_IN: 'sign_in',
  SIGN_OUT: 'sign_out',
  SIGN_UP: 'sign_up',
  LOAD_USER_DATA: 'load_user_data',
  CREATE_TRANSACTION: 'create_transaction',
  UPDATE_TRANSACTION: 'update_transaction',
  DELETE_TRANSACTION: 'delete_transaction',
  TRANSFER_MONEY: 'transfer_money',
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  RECEIVE_MONEY: 'receive_money',
  LOAD_ACCOUNTS: 'load_accounts',
  UPDATE_ACCOUNT: 'update_account',
  LOAD_MESSAGES: 'load_messages',
  UPDATE_MESSAGE: 'update_message',
  LOAD_ADMIN_DATA: 'load_admin_data',
  BACKUP_DATA: 'backup_data',
  IMPORT_DATA: 'import_data'
};

// Loading Provider Component
export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});

  const setLoading = useCallback((operation, isLoading, message = 'Loading...') => {
    setLoadingStates(prev => ({
      ...prev,
      [operation]: isLoading ? { isLoading: true, message } : undefined
    }));
  }, []);

  const clearLoading = useCallback((operation) => {
    setLoadingStates(prev => {
      const newState = { ...prev };
      delete newState[operation];
      return newState;
    });
  }, []);

  const isLoading = useCallback((operation) => {
    return Boolean(loadingStates[operation]?.isLoading);
  }, [loadingStates]);

  const getLoadingMessage = useCallback((operation) => {
    return loadingStates[operation]?.message || 'Loading...';
  }, [loadingStates]);

  const getGlobalLoading = useCallback(() => {
    return Object.keys(loadingStates).length > 0;
  }, [loadingStates]);

  const getAllLoadingOperations = useCallback(() => {
    return Object.keys(loadingStates);
  }, [loadingStates]);

  const value = {
    // State
    loadingStates,
    
    // Actions
    setLoading,
    clearLoading,
    
    // Getters
    isLoading,
    getLoadingMessage,
    getGlobalLoading,
    getAllLoadingOperations
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

// Custom hook to use Loading Context
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Helper hook for specific operations
export const useLoadingOperation = (operation) => {
  const { isLoading, getLoadingMessage, setLoading, clearLoading } = useLoading();
  
  return {
    isLoading: isLoading(operation),
    message: getLoadingMessage(operation),
    setLoading: useCallback((loading, message) => setLoading(operation, loading, message), [setLoading, operation]),
    clearLoading: useCallback(() => clearLoading(operation), [clearLoading, operation])
  };
};

export default LoadingContext;