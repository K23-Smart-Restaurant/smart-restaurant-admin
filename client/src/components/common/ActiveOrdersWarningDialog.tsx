import React from "react";
import {
  AlertTriangleIcon,
  XIcon,
  PowerOffIcon,
  ShoppingCartIcon,
} from "lucide-react";
import type { ActiveOrderInfo } from "../../services/tableService";

interface ActiveOrdersWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tableNumber: number;
  activeOrdersCount: number;
  orders: ActiveOrderInfo[];
  isLoading?: boolean;
}

export const ActiveOrdersWarningDialog: React.FC<
  ActiveOrdersWarningDialogProps
> = ({
  isOpen,
  onClose,
  onConfirm,
  tableNumber,
  activeOrdersCount,
  orders,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-amber-50 px-6 py-4 border-b border-amber-100">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangleIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Active Orders Warning
              </h3>
              <p className="text-sm text-amber-600 font-medium">
                Table {tableNumber}
              </p>
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
          <div className="flex items-center gap-2 text-amber-700 mb-4">
            <ShoppingCartIcon className="w-5 h-5" />
            <span className="font-medium">
              {activeOrdersCount} active order{activeOrdersCount > 1 ? "s" : ""}{" "}
              found
            </span>
          </div>

          <p className="text-gray-600 leading-relaxed mb-4">
            This table has unpaid orders. Deactivating will prevent new orders
            from being placed but will not affect existing orders.
          </p>

          {/* Orders List */}
          {orders.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-charcoal">
                      Order #{order.orderNumber}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>{order.itemCount} item(s)</span>
                    <span className="font-medium">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Created: {formatDate(order.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <AlertTriangleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Are you sure you want to deactivate this table? Consider
                completing or canceling active orders first.
              </span>
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
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deactivating...
              </>
            ) : (
              <>
                <PowerOffIcon className="w-4 h-4" />
                Deactivate Anyway
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
