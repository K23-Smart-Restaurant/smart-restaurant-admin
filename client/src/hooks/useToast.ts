import { useState, useCallback } from 'react';

export interface ToastData {
  id: string;
  type: 'success' | 'error';
  title: string;
  message: string;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((
    type: 'success' | 'error',
    title: string,
    message: string
  ) => {
    const id = Date.now().toString() + Math.random().toString(36);
    const newToast: ToastData = { id, type, title, message };
    
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    showToast('success', title, message);
  }, [showToast]);

  const showError = useCallback((title: string, message: string) => {
    showToast('error', title, message);
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    removeToast,
  };
};
