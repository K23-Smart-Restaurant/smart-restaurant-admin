import React from 'react';
import { AlertTriangleIcon, Trash2Icon, XIcon } from 'lucide-react';

interface ConfirmDeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    itemName?: string;
    isLoading?: boolean;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Delete',
    message,
    itemName,
    isLoading = false,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangleIcon className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                            {itemName && (
                                <p className="text-sm text-red-600 font-medium">"{itemName}"</p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="ml-auto p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5">
                    <p className="text-gray-600 leading-relaxed">{message}</p>

                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800 flex items-start gap-2">
                            <AlertTriangleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>This action cannot be undone. The item will be permanently removed from the database.</span>
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2Icon className="w-4 h-4" />
                                Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
