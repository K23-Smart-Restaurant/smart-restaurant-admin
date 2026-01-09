import React, { useState } from 'react';
import { X, Printer, CreditCard, DollarSign, Receipt } from 'lucide-react';
import type { Order } from '../../services/orderService';

interface BillFormProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
    onGenerateBill: (orderId: string, discount: number) => Promise<void>;
    onMarkPaid: (orderId: string, paymentMethod: 'CASH' | 'CARD') => Promise<void>;
}

/**
 * BillForm - Modal for viewing order summary and processing payment (Light Theme)
 */
const BillForm: React.FC<BillFormProps> = ({
    isOpen,
    onClose,
    order,
    onGenerateBill,
    onMarkPaid,
}) => {
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen || !order) return null;

    const subtotal = Number(order.totalAmount);
    const taxRate = 0.10; // 10% tax
    const tax = subtotal * taxRate;
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal + tax - discountAmount;

    const handleGenerateBill = async () => {
        setIsProcessing(true);
        try {
            await onGenerateBill(order.id, discount);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleMarkPaid = async () => {
        setIsProcessing(true);
        try {
            await onMarkPaid(order.id, paymentMethod);
            onClose();
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-naples/10 to-arylide/10 border-b border-gray-200 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-naples to-arylide rounded-full p-3">
                                <Receipt className="w-6 h-6 text-charcoal" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-charcoal">Bill Summary</h2>
                                <p className="text-gray-600 text-sm">
                                    Table #{order.table?.tableNumber} • Order #{order.orderNumber}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
                        {/* Order Items */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-charcoal mb-3">Order Items:</h3>
                            <div className="space-y-2">
                                {order.orderItems?.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-charcoal bg-gradient-to-r from-naples/20 to-arylide/20 border border-naples/30 rounded px-2 py-1 text-sm">
                                                {item.quantity}x
                                            </span>
                                            <div>
                                                <p className="font-medium text-charcoal">
                                                    {item.menuItem?.name || 'Item'}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    ${item.unitPrice.toFixed(2)} each
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-charcoal">
                                            ${item.subtotal.toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Discount Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-charcoal mb-2">
                                Discount (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={discount}
                                onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-naples focus:outline-none transition-colors duration-200"
                                placeholder="Enter discount percentage"
                            />
                        </div>

                        {/* Bill Summary */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-4 mb-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal:</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Tax (10%):</span>
                                    <span className="font-medium">${tax.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-700">
                                        <span>Discount ({discount}%):</span>
                                        <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t-2 border-gray-300 pt-2 mt-2">
                                    <div className="flex justify-between text-charcoal">
                                        <span className="text-lg font-bold">Total:</span>
                                        <span className="text-2xl font-bold text-naples">
                                            ${total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-charcoal mb-3">
                                Payment Method
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setPaymentMethod('CASH')}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${paymentMethod === 'CASH'
                                        ? 'bg-gradient-to-r from-naples/20 to-arylide/20 border-naples text-charcoal'
                                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                                        }`}
                                >
                                    <DollarSign className="w-6 h-6 mx-auto mb-2" />
                                    <span className="font-semibold">Cash</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('CARD')}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${paymentMethod === 'CARD'
                                        ? 'bg-gradient-to-r from-naples/20 to-arylide/20 border-naples text-charcoal'
                                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                                        }`}
                                >
                                    <CreditCard className="w-6 h-6 mx-auto mb-2" />
                                    <span className="font-semibold">Card</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
                        <button
                            onClick={handleGenerateBill}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-charcoal rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 border border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Printer className="w-5 h-5" />
                            Print Bill
                        </button>
                        <button
                            onClick={handleMarkPaid}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CreditCard className="w-5 h-5" />
                            {isProcessing ? 'Processing...' : 'Mark as Paid'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BillForm;
