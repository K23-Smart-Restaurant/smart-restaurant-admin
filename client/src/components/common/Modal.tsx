import React from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { XIcon } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <Transition show={isOpen}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-charcoal/80 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 -translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <DialogPanel className={`w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl bg-white shadow-elevation-3 transition-all`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gradient-primary/5 to-gradient-secondary/5">
                  <DialogTitle className="text-xl font-bold text-charcoal bg-gradient-to-r from-gradient-primary to-gradient-secondary bg-clip-text text-transparent">
                    {title}
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-600 hover:bg-gradient-to-r hover:from-gradient-primary/10 hover:to-gradient-secondary/10 rounded-lg transition-all duration-300 transform hover:scale-110 hover:rotate-90 group"
                  >
                    <XIcon className="w-5 h-5 transition-transform duration-300" />
                  </button>
                </div>
                <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
                  {children}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
