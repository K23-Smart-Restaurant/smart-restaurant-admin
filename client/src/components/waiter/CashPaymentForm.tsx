import React, { useState } from 'react';
import { DollarSign, CreditCard, Banknote, Loader2, X } from 'lucide-react';
import type { Order } from '../../services/orderService';

interface CashPaymentFormProps {
    order: Order;
    onSubmit: (paymentMethod: 'CASH' | 'CARD', amountPaid: number) => Promise<void>;
    onCancel: () => void;
}

/**
 * CashPaymentForm Component
 * Allows waiters to process cash/card payments at the restaurant
 */
const CashPaymentForm: React.FC<CashPaymentFormProps> = ({ order, onSubmit, onCancel }) => {
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');
    const [amountPaid, setAmountPaid] = useState<string>(order.totalAmount.toString());
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalAmount = Number(order.totalAmount);
    const paidAmount = parseFloat(amountPaid) || 0;
    const change = paidAmount - totalAmount;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (paidAmount < totalAmount) {
            setError(`Insufficient amount. Need at least $${totalAmount.toFixed(2)}`);
            return;
        }

        setIsProcessing(true);
        try {
            await onSubmit(paymentMethod, paidAmount);
        } catch (err: any) {
            setError(err.message || 'Failed to process payment');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Process Payment</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Order #{order.orderNumber} • Table {order.table?.tableNumber || 'N/A'}
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={isProcessing}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Order Total */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium">Order Total:</span>
                            <span className="text-3xl font-bold text-emerald-600">
                                ${totalAmount.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Payment Method
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('CASH')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'CASH'
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    }`}
                            >
                                <Banknote className="w-8 h-8" />
                                <span className="font-semibold">Cash</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('CARD')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'CARD'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    }`}
                            >
                                <CreditCard className="w-8 h-8" />
                                <span className="font-semibold">Card</span>
                            </button>
                        </div>
                    </div>

                    {/* Amount Paid Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Amount Received
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="number"
                                step="0.01"
                                min={totalAmount}
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none text-lg font-semibold"
                                placeholder="0.00"
                                disabled={isProcessing}
                                required
                            />
                        </div>
                    </div>

                    {/* Change Display (for cash only) */}
                    {paymentMethod === 'CASH' && paidAmount >= totalAmount && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 font-medium">Change to Return:</span>
                                <span className="text-2xl font-bold text-amber-600">
                                    ${change.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isProcessing}
                            className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isProcessing || paidAmount < totalAmount}
                            className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <span>Complete Payment</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CashPaymentForm;
