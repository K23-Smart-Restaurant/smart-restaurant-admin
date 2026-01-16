import React, { useState, useEffect } from 'react';
import { X, User, Phone, Clock, DollarSign, FileText, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Order, OrderStatus } from '../../hooks/useOrders';
import type { OrderItemStatus } from '../../services/orderService';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateOrderStatus: (id: string, newStatus: OrderStatus) => void;
  onUpdateItemStatus: (orderItemId: string, itemStatus: OrderItemStatus) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateOrderStatus,
  onUpdateItemStatus,
}) => {
  const { t } = useTranslation(['orders', 'common']);
  // Track elapsed time in state to avoid calling Date.now() during render
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Preven scroll outside when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Calculate elapsed time when modal opens or order changes
  useEffect(() => {
    if (!order) {
      setElapsedMinutes(0);
      return;
    }

    const updateElapsedTime = () => {
      const startTime = new Date(order.createdAt).getTime();

      // If order is cancelled, set elapsed to 0
      if (order.status === 'CANCELLED') {
        setElapsedMinutes(0);
        return;
      }

      // If order is completed/paid, use the completion time instead of current time
      const isFinished =
        order.paymentStatus === 'PAID' || order.status === 'COMPLETED' || order.status === 'SERVED';

      const endTime = isFinished && order.paidAt ? new Date(order.paidAt).getTime() : Date.now();

      const elapsed = Math.floor((endTime - startTime) / 60000);
      setElapsedMinutes(elapsed);
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${Number(amount).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Status timeline steps
  const statusSteps: OrderStatus[] = [
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'SERVED',
    'BILL_REQUESTED',
    'COMPLETED',
    // 'CANCELLED'
  ];
  const currentStatusIndex = statusSteps.indexOf(order.status);

  // Get item status color
  const getItemStatusColor = (status: OrderItemStatus) => {
    switch (status) {
      case 'QUEUED':
        return 'bg-gray-200 text-gray-700';
      case 'COOKING':
        return 'bg-orange-200 text-orange-800';
      case 'READY':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  // Get translated status
  const getStatusLabel = (status: OrderStatus) => {
    const statusMap: Record<OrderStatus, string> = {
      PENDING: t('orders:status.pending'),
      CONFIRMED: t('orders:status.confirmed'),
      PREPARING: t('orders:status.preparing'),
      READY: t('orders:status.ready'),
      SERVED: t('orders:status.served'),
      COMPLETED: t('orders:status.completed'),
      BILL_REQUESTED: t('orders:status.billRequested'),
      CANCELLED: t('orders:status.cancelled'),
    };
    return statusMap[status] || status;
  };

  // Get translated item status
  const getItemStatusLabel = (status: OrderItemStatus) => {
    const itemStatusMap: Record<OrderItemStatus, string> = {
      QUEUED: t('orders:itemStatus.queued'),
      COOKING: t('orders:itemStatus.cooking'),
      READY: t('orders:itemStatus.ready'),
    };
    return itemStatusMap[status] || status;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg overflow-hidden shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-charcoal">
                {t('orders:details.orderDetails')} #{order.orderNumber}
              </h2>
              <p className="text-xl text-gray-600 mt-1">
                {order.tableName ||
                  `${t('orders:list.table')} ${order.table?.tableNumber || 'N/A'}`}
              </p>
            </div>

            {/* Customer & Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-charcoal mb-3">
                  {t('orders:details.customerInfo')}
                </h3>
                {order.guestName ? (
                  <>
                    <div className="flex items-center text-gray-700 mb-2">
                      <User className="w-4 h-4 mr-2" />
                      <span>{order.guestName}</span>
                    </div>
                    {order.guestContact && (
                      <div className="flex items-center text-gray-700">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{order.guestContact}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center text-gray-700">
                    <User className="w-4 h-4 mr-2" />
                    <span>{t('orders:details.registeredCustomerId', { id: order.userId })}</span>
                  </div>
                )}
                {order.waiterId && (
                  <div className="mt-2 text-sm text-gray-600">
                    {t('orders:details.waiterId', { id: order.waiterId })}
                  </div>
                )}
              </div>

              {/* Order Timing */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-charcoal mb-3">
                  {t('orders:details.orderTiming')}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      {t('orders:details.placed')} {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      {t('orders:details.elapsed')} {elapsedMinutes} {t('orders:details.minutes')}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      {t('orders:details.expected')} {order.prepTime || 'N/A'}{' '}
                      {t('orders:details.minutes')}
                    </span>
                  </div>
                  {order.paidAt && (
                    <div className="flex items-center text-gray-700">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span>
                        {t('orders:details.paidAt')} {formatDate(order.paidAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-charcoal mb-4 text-lg">
                {t('orders:card.orderItems')}
              </h3>
              <div className="space-y-4">
                {order.orderItems?.map((item) => (
                  <div key={item.id} className="border-l-4 border-naples pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-charcoal text-lg">
                          {item.quantity}x {item.menuItem?.name || t('orders:details.unknownItem')}{' '}
                          - {formatCurrency(item.unitPrice)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {t('orders:details.subtotal')}: {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                      <select
                        value={item.itemStatus}
                        onChange={(e) =>
                          onUpdateItemStatus(item.id, e.target.value as OrderItemStatus)
                        }
                        className={`px-3 py-1 rounded text-sm font-semibold ${getItemStatusColor(
                          item.itemStatus
                        )} border-none cursor-pointer`}
                      >
                        <option value="QUEUED">{t('orders:itemStatus.queued')}</option>
                        <option value="COOKING">{t('orders:itemStatus.cooking')}</option>
                        <option value="READY">{t('orders:itemStatus.ready')}</option>
                      </select>
                    </div>
                    {item.specialInstructions && (
                      <div className="mt-2 pl-6 text-sm text-gray-600 italic">
                        <FileText className="w-3 h-3 inline mr-1" />
                        {t('orders:card.note')} {item.specialInstructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="bg-naples p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-charcoal">
                  {t('orders:details.orderTotal')}
                </span>
                <span className="text-2xl font-bold text-charcoal">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  {t('orders:details.orderNotes')}
                </h3>
                <p className="text-yellow-700">{order.notes}</p>
              </div>
            )}

            {/* Status Timeline */}
            <div className="mb-6">
              <h3 className="font-semibold text-charcoal mb-4">
                {t('orders:details.orderProgress')}
              </h3>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{
                      width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {/* Status Steps */}
                <div className="relative flex justify-between">
                  {statusSteps.map((status, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    return (
                      <div key={status} className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                            isCompleted
                              ? 'bg-green-500 border-green-500'
                              : 'bg-white border-gray-300'
                          } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}
                        >
                          {isCompleted && <ChevronRight className="w-5 h-5 text-white" />}
                        </div>
                        <span
                          className={`mt-2 text-xs font-medium ${
                            isCompleted ? 'text-charcoal' : 'text-gray-400'
                          }`}
                        >
                          {getStatusLabel(status)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Status Update Dropdown */}
            <div className="mb-6">
              <label
                htmlFor="status-update"
                className="block text-sm font-medium text-charcoal mb-2"
              >
                {t('orders:details.updateOrderStatus')}
              </label>
              <select
                id="status-update"
                value={order.status}
                onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-naples focus:border-naples"
              >
                <option value="PENDING">{t('orders:status.pending')}</option>
                <option value="CONFIRMED">{t('orders:status.confirmed')}</option>
                <option value="PREPARING">{t('orders:status.preparing')}</option>
                <option value="READY">{t('orders:status.ready')}</option>
                <option value="SERVED">{t('orders:status.served')}</option>
                <option value="PAID">{t('orders:payment.paid')}</option>
                <option value="CANCELLED">{t('orders:status.cancelled')}</option>
              </select>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full bg-charcoal hover:bg-charcoal/90 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {t('orders:details.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
