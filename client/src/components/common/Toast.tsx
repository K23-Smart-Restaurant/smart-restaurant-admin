import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, XIcon } from 'lucide-react';
import type { ToastData } from '../../hooks/useToast';

interface ToastProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const isSuccess = toast.type === 'success';

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg shadow-lg backdrop-blur-sm animate-in slide-in-from-right duration-300 ${
        isSuccess
          ? 'bg-green-50 border border-green-200'
          : 'bg-red-50 border border-red-200'
      }`}
    >
      {isSuccess ? (
        <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      )}
      
      <div className="flex-1 min-w-0">
        <p
          className={`font-semibold text-sm ${
            isSuccess ? 'text-green-900' : 'text-red-900'
          }`}
        >
          {toast.title}
        </p>
        <p
          className={`text-sm mt-1 ${
            isSuccess ? 'text-green-700' : 'text-red-700'
          }`}
        >
          {toast.message}
        </p>
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className={`p-1 rounded-full transition-colors ${
          isSuccess
            ? 'text-green-600 hover:bg-green-100'
            : 'text-red-600 hover:bg-red-100'
        }`}
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
