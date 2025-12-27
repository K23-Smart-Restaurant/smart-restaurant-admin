import React, { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';
import type { ToastData } from '../hooks/useToast';
import { ToastContainer } from '../components/common/ToastContainer';

interface ToastContextValue {
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, showSuccess, showError, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
};
