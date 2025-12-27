import React from 'react';
import { Toast } from './Toast';
import type { ToastData } from '../../hooks/useToast';

interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-md w-full pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <div key={toast.id} className="mb-2">
            <Toast toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </div>
    </div>
  );
};
