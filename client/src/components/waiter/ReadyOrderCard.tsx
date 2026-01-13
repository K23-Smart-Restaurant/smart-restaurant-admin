import React, { useState } from 'react';
import { CheckCircle, User, ChevronDown, Utensils, DollarSign } from 'lucide-react';
import TimerBadge from '../common/TimerBadge';
import type { Order } from '../../services/orderService';

interface ReadyOrderCardProps {
  order: Order;
  onMarkServed: (orderId: string) => void;
  onProcessPayment?: (order: Order) => void; // Optional payment handler
}

/**
 * ReadyOrderCard - Display ready orders for waiter to serve (Light Theme)
 */
const ReadyOrderCard: React.FC<ReadyOrderCardProps> = ({
  order,
  onMarkServed,
  onProcessPayment,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMarkServed = async () => {
    setIsProcessing(true);
    try {
      await onMarkServed(order.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessPayment = () => {
    if (onProcessPayment) {
      onProcessPayment(order);
    }
  };

  const showPaymentButton =
    order.billRequested && order.paymentStatus !== 'PAID' && onProcessPayment;

  return (
    <div className="bg-white border-2 border-green-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full p-3">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-charcoal">
                Table #{order.table?.tableNumber || 'N/A'}
              </h3>
              <p className="text-gray-600 text-sm">Order #{order.orderNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showPaymentButton && (
              <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-lg text-xs font-semibold border border-blue-300 animate-pulse">
                BILL REQUESTED
              </span>
            )}
            <span className="px-3 py-1 bg-green-200 text-green-800 rounded-lg text-xs font-semibold border border-green-300">
              READY TO SERVE
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-white rounded-full p-1.5 hover:bg-gray-50 transition-colors duration-200"
            >
              <ChevronDown
                className={`w-5 h-5 text-charcoal transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-700">
            <User className="w-4 h-4" />
            <span className="font-medium">{order.guestName || 'Guest'}</span>
          </div>
          <TimerBadge startTime={order.createdAt} />
        </div>
      </div>

      {/* Order Items (Expandable) */}
      {isExpanded && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h4 className="font-semibold text-charcoal mb-3 text-sm">Order Items:</h4>
          <div className="space-y-2">
            {order.orderItems?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm bg-white p-2 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-charcoal bg-green-100 rounded px-2 py-0.5 text-xs border border-green-300">
                    {item.quantity}x
                  </span>
                  <span className="text-gray-700">{item.menuItem?.name || 'Item'}</span>
                </div>
                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-semibold border border-green-300">
                  ✓ READY
                </span>
              </div>
            ))}
          </div>
          {order.notes && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-xs">
                <span className="font-semibold">Note: </span>
                {order.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 bg-white">
        {showPaymentButton ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleMarkServed}
              disabled={isProcessing}
              className="py-3 px-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 border-2 border-green-300 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5" />
              {isProcessing ? 'Processing...' : 'Mark Served'}
            </button>
            <button
              onClick={handleProcessPayment}
              className="py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 border-2 border-blue-300 hover:border-blue-400"
            >
              <DollarSign className="w-5 h-5" />
              Process Payment
            </button>
          </div>
        ) : (
          <button
            onClick={handleMarkServed}
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 border-2 border-green-300 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-5 h-5" />
            {isProcessing ? 'Processing...' : 'Mark as Served'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReadyOrderCard;
