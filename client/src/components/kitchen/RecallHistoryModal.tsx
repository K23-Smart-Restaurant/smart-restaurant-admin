import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNowLocalized } from '../../utils/dateUtils';
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
  const { t } = useTranslation('kitchen');

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-naples/10 to-arylide/10 border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-r from-naples to-arylide rounded-full p-2 sm:p-3">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-charcoal" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal">
                  {t('history.title')}
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">{t('history.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>
          </div>

          {/* Body */}
          <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(80vh-8rem)] bg-gradient-to-br from-gray-50/50 via-white to-gray-100/50">
            {completedOrders.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {completedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-charcoal">
                            {t('history.table', { number: order.table?.tableNumber || 'N/A' })}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {t('history.orderNumber', { number: order.orderNumber })}
                            {order.guestName && ` • ${order.guestName}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <p className="text-xs sm:text-sm text-gray-600">
                          {t('history.completed')}{' '}
                          {formatDistanceToNowLocalized(new Date(order.updatedAt), {
                            addSuffix: true,
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.updatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-1.5 sm:space-y-2 ml-6 sm:ml-8">
                      {order.orderItems &&
                        order.orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start sm:items-center justify-between text-xs sm:text-sm gap-2 flex-col sm:flex-row"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-charcoal font-semibold bg-gradient-to-r from-naples/20 to-arylide/20 border border-naples/30 rounded px-1.5 sm:px-2 py-0.5 text-xs">
                                {item.quantity}x
                              </span>
                              <span className="text-gray-700">
                                {item.menuItem?.name || 'Unknown Item'}
                              </span>
                            </div>
                            {item.specialInstructions && (
                              <span className="text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded ml-8 sm:ml-0">
                                {t('history.note')} {item.specialInstructions}
                              </span>
                            )}
                          </div>
                        ))}
                    </div>

                    {/* Order Notes */}
                    {order.notes && (
                      <div className="mt-2 sm:mt-3 ml-6 sm:ml-8 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs text-blue-700">
                          <span className="font-semibold">{t('history.note')} </span>
                          {order.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 text-base sm:text-lg">{t('history.empty')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RecallHistoryModal;
