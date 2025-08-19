import React, { createContext, useContext, useState, useCallback } from 'react';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [status, setStatus] = useState({
    isProcessing: false,
    currentStep: '',
    error: null,
    txHash: null,
    receipt: null,
    success: false,
    timestamp: null
  });

  const updateStatus = useCallback((updates) => {
    setStatus(prev => ({
      ...prev,
      ...updates,
      // Only update timestamp if we have new content
      timestamp: updates.currentStep || updates.error ? Date.now() : prev.timestamp
    }));
  }, []);

  const resetStatus = useCallback(() => {
    setStatus({
      isProcessing: false,
      currentStep: '',
      error: null,
      txHash: null,
      receipt: null,
      success: false,
      timestamp: null
    });
  }, []);

  return (
    <TransactionContext.Provider value={{ 
      status, 
      updateStatus, 
      resetStatus 
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};
