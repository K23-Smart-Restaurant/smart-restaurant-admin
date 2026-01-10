import React from 'react';
import { X, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Order } from '../../services/orderService';

interface RecallHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedOrders: Order[];
}

/**
 * RecallHistoryModal - Display last 10 completed orders (Light Theme)
 */
const RecallHistoryModal: React.FC<RecallHistoryModalProps> = ({
  isOpen,
  onClose,
  completedOrders,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-naples/10 to-arylide/10 border-b border-gray-200 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-naples to-arylide rounded-full p-3">
                <Clock className="w-6 h-6 text-charcoal" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-charcoal">Order History</h2>
                <p className="text-gray-600 text-sm">Last 10 completed orders</p>
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
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-8rem)] bg-gradient-to-br from-gray-50/50 via-white to-gray-100/50">
            {completedOrders.length > 0 ? (
              <div className="space-y-4">
                {completedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-charcoal">
                            Table #{order.table?.tableNumber || 'N/A'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Order #{order.orderNumber}
                            {order.guestName && ` • ${order.guestName}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Completed{' '}
                          {formatDistanceToNow(new Date(order.updatedAt), { addSuffix: true })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.updatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2 ml-8">
                      {order.orderItems &&
                        order.orderItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-charcoal font-semibold bg-gradient-to-r from-naples/20 to-arylide/20 border border-naples/30 rounded px-2 py-0.5">
                                {item.quantity}x
                              </span>
                              <span className="text-gray-700">
                                {item.menuItem?.name || 'Unknown Item'}
                              </span>
                            </div>
                            {item.specialInstructions && (
                              <span className="text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded">
                                Note: {item.specialInstructions}
                              </span>
                            )}
                          </div>
                        ))}
                    </div>

                    {/* Order Notes */}
                    {order.notes && (
                      <div className="mt-3 ml-8 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs text-blue-700">
                          <span className="font-semibold">Note: </span>
                          {order.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No completed orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RecallHistoryModal;
