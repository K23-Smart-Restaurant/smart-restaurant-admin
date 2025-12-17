import React from "react";
import {
  X,
  User,
  Phone,
  Clock,
  DollarSign,
  FileText,
  ChevronRight,
} from "lucide-react";
import type {
  Order,
  OrderStatus,
  OrderItemStatus,
} from "../../hooks/useOrders";

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateOrderStatus: (id: string, newStatus: OrderStatus) => void;
  onUpdateItemStatus: (
    orderItemId: string,
    itemStatus: OrderItemStatus
  ) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateOrderStatus,
  onUpdateItemStatus,
}) => {
  if (!isOpen || !order) return null;

  // Calculate elapsed time
  const elapsedMinutes = Math.floor(
    (Date.now() - new Date(order.createdAt).getTime()) / 60000
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status timeline steps
  const statusSteps: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "SERVED",
    "PAID",
  ];
  const currentStatusIndex = statusSteps.indexOf(order.status);

  // Get item status color
  const getItemStatusColor = (status: OrderItemStatus) => {
    switch (status) {
      case "QUEUED":
        return "bg-gray-200 text-gray-700";
      case "COOKING":
        return "bg-orange-200 text-orange-800";
      case "READY":
        return "bg-green-200 text-green-800";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                Order #{order.orderNumber}
              </h2>
              <p className="text-xl text-gray-600 mt-1">{order.tableName}</p>
            </div>

            {/* Customer & Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-charcoal mb-3">
                  Customer Information
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
                    <span>Registered Customer (ID: {order.userId})</span>
                  </div>
                )}
                {order.waiterId && (
                  <div className="mt-2 text-sm text-gray-600">
                    Waiter ID: {order.waiterId}
                  </div>
                )}
              </div>

              {/* Order Timing */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-charcoal mb-3">
                  Order Timing
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Placed: {formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Elapsed: {elapsedMinutes} minutes</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Expected: {order.prepTime} minutes</span>
                  </div>
                  {order.paidAt && (
                    <div className="flex items-center text-gray-700">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span>Paid: {formatDate(order.paidAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-charcoal mb-4 text-lg">
                Order Items
              </h3>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="border-l-4 border-naples pl-4 py-2"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-charcoal text-lg">
                          {item.quantity}x {item.menuItemName} -{" "}
                          {formatCurrency(item.unitPrice)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Subtotal: {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                      <select
                        value={item.itemStatus}
                        onChange={(e) =>
                          onUpdateItemStatus(
                            item.id,
                            e.target.value as OrderItemStatus
                          )
                        }
                        className={`px-3 py-1 rounded text-sm font-semibold ${getItemStatusColor(
                          item.itemStatus
                        )} border-none cursor-pointer`}
                      >
                        <option value="QUEUED">QUEUED</option>
                        <option value="COOKING">COOKING</option>
                        <option value="READY">READY</option>
                      </select>
                    </div>
                    {item.specialInstructions && (
                      <div className="mt-2 pl-6 text-sm text-gray-600 italic">
                        <FileText className="w-3 h-3 inline mr-1" />
                        Note: {item.specialInstructions}
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
                  Order Total:
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
                  Order Notes:
                </h3>
                <p className="text-yellow-700">{order.notes}</p>
              </div>
            )}

            {/* Status Timeline */}
            <div className="mb-6">
              <h3 className="font-semibold text-charcoal mb-4">
                Order Progress
              </h3>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{
                      width: `${
                        (currentStatusIndex / (statusSteps.length - 1)) * 100
                      }%`,
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
                              ? "bg-green-500 border-green-500"
                              : "bg-white border-gray-300"
                          } ${isCurrent ? "ring-4 ring-green-200" : ""}`}
                        >
                          {isCompleted && (
                            <ChevronRight className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <span
                          className={`mt-2 text-xs font-medium ${
                            isCompleted ? "text-charcoal" : "text-gray-400"
                          }`}
                        >
                          {status}
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
                Update Order Status:
              </label>
              <select
                id="status-update"
                value={order.status}
                onChange={(e) =>
                  onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-naples focus:border-naples"
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PREPARING">Preparing</option>
                <option value="READY">Ready</option>
                <option value="SERVED">Served</option>
                <option value="PAID">Paid</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full bg-charcoal hover:bg-charcoal/90 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
