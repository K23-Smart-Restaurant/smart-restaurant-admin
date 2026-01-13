import React, { useState } from 'react';
import { ChefHat, CheckCircle, Circle, ChevronDown, X, AlertCircle } from 'lucide-react';
import TimerBadge from '../common/TimerBadge';
import type { Order, OrderItem, OrderItemStatus } from '../../services/orderService';

interface KitchenOrderCardProps {
  order: Order;
  onMarkReady: (orderId: string) => void;
  onUpdateItemStatus: (
    orderId: string,
    itemId: string,
    status: 'QUEUED' | 'COOKING' | 'READY'
  ) => void;
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  itemName: string;
  currentStatus: string;
  newStatus: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation Dialog for Item Status Change
 */
const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  itemName,
  currentStatus,
  newStatus,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COOKING':
        return 'text-yellow-700';
      case 'READY':
        return 'text-green-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onCancel} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-naples/10 to-arylide/10 border-b border-gray-200 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-naples to-arylide rounded-full p-2">
                <AlertCircle className="w-5 h-5 text-charcoal" />
              </div>
              <h3 className="text-xl font-bold text-charcoal">Update Item Status</h3>
            </div>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-gray-700 mb-4">Are you sure you want to update the status for:</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="font-semibold text-charcoal text-lg">{itemName}</p>
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className={`font-semibold ${getStatusColor(currentStatus)}`}>
                {currentStatus}
              </span>
              <span className="text-gray-400">→</span>
              <span className={`font-semibold ${getStatusColor(newStatus)}`}>{newStatus}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors duration-200 border border-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-naples to-arylide hover:from-naples/90 hover:to-arylide/90 text-charcoal rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * KitchenOrderCard - Display order details for kitchen staff (Light Theme)
 * Features: High contrast, large fonts, item-level status tracking
 */
const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({
  order,
  onMarkReady,
  onUpdateItemStatus,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    itemId: string;
    itemName: string;
    currentStatus: string;
    newStatus: OrderItemStatus;
  }>({
    isOpen: false,
    itemId: '',
    itemName: '',
    currentStatus: '',
    newStatus: 'QUEUED',
  });

  const handleMarkReady = async () => {
    setIsUpdating(true);
    try {
      await onMarkReady(order.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleItemStatusClick = (item: OrderItem) => {
    // One-way status progression: QUEUED -> COOKING -> READY
    // Once READY, item cannot be changed back
    const statusFlow: Record<string, OrderItemStatus | null> = {
      QUEUED: 'COOKING',
      COOKING: 'READY',
      READY: null, // No further action allowed once ready
    };

    const newStatus = statusFlow[item.itemStatus];

    // If item is already READY, do nothing (no dialog shown)
    if (!newStatus) {
      return;
    }

    setConfirmDialog({
      isOpen: true,
      itemId: item.id,
      itemName: item.menuItem?.name || 'Unknown Item',
      currentStatus: item.itemStatus,
      newStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    await onUpdateItemStatus(order.id, confirmDialog.itemId, confirmDialog.newStatus);
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  const handleCancelStatusChange = () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  const getItemStatusBadge = (status: string) => {
    switch (status) {
      case 'COOKING':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <ChefHat className="w-5 h-5 text-yellow-700 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-bold text-yellow-800">Cooking</span>
            <div className="ml-1 flex gap-0.5">
              <div className="w-1 h-1 bg-yellow-600 rounded-full animate-pulse" />
              <div
                className="w-1 h-1 bg-yellow-600 rounded-full animate-pulse"
                style={{ animationDelay: '0.2s' }}
              />
              <div
                className="w-1 h-1 bg-yellow-600 rounded-full animate-pulse"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
          </div>
        );
      case 'READY':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-400 rounded-xl shadow-md">
            <CheckCircle className="w-5 h-5 text-green-700" />
            <span className="font-bold text-green-800">Ready</span>
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-300 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <Circle className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-bold text-gray-700">Queued</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        );
    }
  };

  const getStatusBadge = () => {
    switch (order.status) {
      case 'CONFIRMED':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold border border-blue-300">
            NEW
          </span>
        );
      case 'PREPARING':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-semibold border border-yellow-300">
            COOKING
          </span>
        );
      case 'READY':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold border border-green-300">
            READY
          </span>
        );
      default:
        return null;
    }
  };

  const allItemsReady = order.orderItems?.every((item) => item.itemStatus === 'READY') ?? false;
  const canMarkReady = order.status === 'PREPARING' && allItemsReady;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Header */}
        <div
          className="bg-gradient-to-r from-naples/10 to-arylide/10 border-b border-gray-200 p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-naples to-arylide rounded-full p-3">
                <ChefHat className="w-6 h-6 text-charcoal" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-charcoal flex items-center gap-3">
                  Table #{order.table?.tableNumber || 'N/A'}
                  {getStatusBadge()}
                </h3>
                <p className="text-gray-600 text-sm">
                  Order #{order.orderNumber}
                  {order.guestName && ` • ${order.guestName}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TimerBadge startTime={order.createdAt} />
              <div className="bg-gray-100 rounded-full p-2">
                <ChevronDown
                  className={`w-6 h-6 text-charcoal transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Body - Order Items */}
        {isExpanded && (
          <div className="p-4 space-y-3">
            {order.orderItems && order.orderItems.length > 0 ? (
              <div className="space-y-3">
                {order.orderItems.map((item: OrderItem) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xl font-bold text-charcoal bg-gradient-to-r from-naples/20 to-arylide/20 border-2 border-naples/40 rounded-full w-10 h-10 flex items-center justify-center shadow-sm">
                            {item.quantity}
                          </span>
                          <div>
                            <h4 className="text-lg font-semibold text-charcoal">
                              {item.menuItem?.name || 'Unknown Item'}
                            </h4>
                            {item.specialInstructions && (
                              <p className="text-sm text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-lg mt-2 inline-block border border-yellow-200">
                                <span className="font-semibold">📝 Note:</span>{' '}
                                {item.specialInstructions}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        onClick={() => handleItemStatusClick(item)}
                        className={`transform hover:scale-105 transition-transform duration-200 ${item.itemStatus === 'READY' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        {getItemStatusBadge(item.itemStatus)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No items in this order</p>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="mt-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">
                  <span className="font-semibold">📋 Order Notes: </span>
                  {order.notes}
                </p>
              </div>
            )}

            {/* Mark Ready Button */}
            {order.status === 'PREPARING' && (
              <button
                onClick={handleMarkReady}
                disabled={!canMarkReady || isUpdating}
                className={`w-full mt-4 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  canMarkReady && !isUpdating
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-300'
                }`}
              >
                {isUpdating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
                    Updating...
                  </span>
                ) : canMarkReady ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    Mark Order Ready
                  </span>
                ) : (
                  'Complete All Items First'
                )}
              </button>
            )}

            {order.status === 'READY' && (
              <div className="mt-4 py-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 text-center">
                <span className="text-green-700 font-bold text-lg flex items-center justify-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Order Ready for Pickup
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        itemName={confirmDialog.itemName}
        currentStatus={confirmDialog.currentStatus}
        newStatus={confirmDialog.newStatus}
        onConfirm={handleConfirmStatusChange}
        onCancel={handleCancelStatusChange}
      />
    </>
  );
};

export default KitchenOrderCard;
