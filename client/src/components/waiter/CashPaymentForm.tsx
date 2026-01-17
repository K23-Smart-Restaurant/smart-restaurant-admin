import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['waiter', 'common']);
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
      setError(t('payment.insufficientAmount'));
      return;
    }

    setIsProcessing(true);
    try {
      await onSubmit(paymentMethod, paidAmount);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process payment';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('payment.title')}</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {t('orders.orderNumber', { number: order.orderNumber })} •{' '}
              {t('orders.table', { number: order.table?.tableNumber || 'N/A' })}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isProcessing}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Order Total */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium text-sm sm:text-base">
                {t('bill.total')}:
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-emerald-600">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
              {t('payment.method')}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'CASH'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Banknote className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="font-semibold text-sm sm:text-base">{t('payment.cash')}</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <CreditCard className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="font-semibold text-sm sm:text-base">{t('payment.card')}</span>
              </button>
            </div>
          </div>

          {/* Amount Paid Input */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              {t('payment.amountReceived')}
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min={totalAmount}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none text-base sm:text-lg font-semibold"
                placeholder="0.00"
                disabled={isProcessing}
                required
              />
            </div>
          </div>

          {/* Change Display (for cash only) */}
          {paymentMethod === 'CASH' && paidAmount >= totalAmount && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium text-sm sm:text-base">
                  {t('payment.change')}:
                </span>
                <span className="text-xl sm:text-2xl font-bold text-amber-600">
                  ${change.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              {t('payment.cancel')}
            </button>
            <button
              type="submit"
              disabled={isProcessing || paidAmount < totalAmount}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>{t('status.processing')}</span>
                </>
              ) : (
                <span>{t('payment.confirm')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashPaymentForm;
