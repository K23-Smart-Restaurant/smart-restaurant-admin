import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, MapPin, DollarSign, Check, X, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Order } from '../../services/orderService';

interface PendingOrderCardProps {
  order: Order;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
}

/**
 * PendingOrderCard - Display pending order for waiter approval (Light Theme)
 */
const PendingOrderCard: React.FC<PendingOrderCardProps> = ({ order, onAccept, onReject }) => {
  const { t } = useTranslation(['waiter', 'common']);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onAccept(order.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(order.id);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white border-2 border-blue-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-r from-naples to-arylide rounded-full p-2 sm:p-3">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-charcoal" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-charcoal">
                {t('orders.table', { number: order.table?.tableNumber || 'N/A' })}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                {t('orders.orderNumber', { number: order.orderNumber })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-200 text-blue-800 rounded-lg text-xs font-semibold border border-blue-300">
              {t('status.pending')}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-white rounded-full p-1 sm:p-1.5 hover:bg-gray-50 transition-colors duration-200"
            >
              <ChevronDown
                className={`w-4 h-4 sm:w-5 sm:h-5 text-charcoal transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-1.5 text-gray-700">
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-medium">{order.guestName || t('orders.guest')}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 text-gray-700">
            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-semibold">${Number(order.totalAmount || 0).toFixed(2)}</span>
          </div>
          <div className="text-gray-500 text-xs ml-auto">
            {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>

      {/* Order Items (Expandable) */}
      {isExpanded && (
        <div className="p-3 sm:p-4 bg-gray-50 border-b border-gray-200">
          <h4 className="font-semibold text-charcoal mb-2 sm:mb-3 text-xs sm:text-sm">
            {t('orders.orderItems')}
          </h4>
          <div className="space-y-2">
            {order.orderItems?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-xs sm:text-sm bg-white p-2 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-charcoal bg-gray-100 rounded px-1.5 sm:px-2 py-0.5 text-xs">
                    {item.quantity}x
                  </span>
                  <span className="text-gray-700">{item.menuItem?.name || 'Item'}</span>
                </div>
                <span className="text-gray-600 font-medium">
                  ${Number(item.subtotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          {order.notes && (
            <div className="mt-2 sm:mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-xs">
                <span className="font-semibold">{t('orders.note')} </span>
                {order.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-3 sm:p-4 bg-white flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          onClick={handleReject}
          disabled={isProcessing}
          className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 border-2 border-red-300 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
          {isProcessing ? t('status.processing') : t('actions.reject')}
        </button>
        <button
          onClick={handleAccept}
          disabled={isProcessing}
          className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 border-2 border-green-300 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          <Check className="w-4 h-4 sm:w-5 sm:h-5" />
          {isProcessing ? (
            t('status.processing')
          ) : (
            <>
              <span className="hidden sm:inline">{t('actions.acceptAndSend')}</span>
              <span className="sm:hidden">{t('actions.accept')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PendingOrderCard;
