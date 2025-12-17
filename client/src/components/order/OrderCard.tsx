import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle, User, Phone } from "lucide-react";
import type { Order, OrderStatus } from "../../hooks/useOrders";

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (id: string, newStatus: OrderStatus) => void;
  onClick: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onUpdateStatus,
  onClick,
}) => {
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);

  // Calculate elapsed time and update every minute
  useEffect(() => {
    const calculateElapsed = () => {
      const now = Date.now();
      const elapsed = Math.floor(
        (now - new Date(order.createdAt).getTime()) / 60000
      );
      setElapsedMinutes(elapsed);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [order.createdAt]);

  // Check if order is overdue
  const isOverdue =
    order.prepTime > 0 &&
    elapsedMinutes > order.prepTime &&
    ["PENDING", "CONFIRMED", "PREPARING"].includes(order.status);

  // Get border color based on status
  const getBorderColor = () => {
    if (isOverdue) return "border-red-500 border-4";
    switch (order.status) {
      case "PENDING":
        return "border-yellow-400 border-2";
      case "CONFIRMED":
        return "border-blue-400 border-2";
      case "PREPARING":
        return "border-blue-500 border-2";
      case "READY":
        return "border-green-500 border-2";
      case "SERVED":
        return "border-gray-400 border-2";
      default:
        return "border-gray-300 border-2";
    }
  };

  // Get status badge color
  const getStatusBadgeColor = () => {
    switch (order.status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PREPARING":
        return "bg-blue-500 text-white";
      case "READY":
        return "bg-green-500 text-white";
      case "SERVED":
        return "bg-gray-500 text-white";
      case "PAID":
        return "bg-purple-500 text-white";
      case "CANCELLED":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get payment status badge color
  const getPaymentBadgeColor = () => {
    switch (order.paymentStatus) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "UNPAID":
        return "bg-red-100 text-red-800";
      case "FAILED":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get item status badge color
  const getItemStatusColor = (status: string) => {
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

  const handleMarkAsReady = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (order.status === "PREPARING") {
      onUpdateStatus(order.id, "READY");
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all ${getBorderColor()} ${
        isOverdue ? "animate-pulse" : ""
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-3xl font-bold text-charcoal">
            #{order.orderNumber}
          </h2>
          <p className="text-xl text-gray-600 mt-1">{order.tableName}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor()}`}
          >
            {order.status}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentBadgeColor()}`}
          >
            {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-4 space-y-1">
        {order.guestName && (
          <div className="flex items-center text-gray-700">
            <User className="w-4 h-4 mr-2" />
            <span className="text-lg">{order.guestName}</span>
          </div>
        )}
        {order.guestContact && (
          <div className="flex items-center text-gray-700">
            <Phone className="w-4 h-4 mr-2" />
            <span className="text-sm">{order.guestContact}</span>
          </div>
        )}
        {order.userId && !order.guestName && (
          <div className="flex items-center text-gray-700">
            <User className="w-4 h-4 mr-2" />
            <span className="text-lg">Registered Customer</span>
          </div>
        )}
      </div>

      {/* Elapsed Time Badge */}
      <div className="mb-4">
        <div
          className={`inline-flex items-center px-3 py-2 rounded-md ${
            isOverdue ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
          }`}
        >
          <Clock className="w-5 h-5 mr-2" />
          <span className="font-semibold text-lg">{elapsedMinutes} min</span>
          {isOverdue && (
            <>
              <AlertTriangle className="w-5 h-5 ml-3 mr-1" />
              <span className="font-bold">
                OVERDUE by {elapsedMinutes - order.prepTime} min
              </span>
            </>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-4 space-y-3">
        <h3 className="text-lg font-semibold text-charcoal border-b pb-2">
          Order Items:
        </h3>
        {order.orderItems.map((item) => (
          <div key={item.id} className="ml-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xl font-medium text-charcoal">
                  {item.quantity}x {item.menuItemName}
                </p>
                {item.specialInstructions && (
                  <p className="text-sm text-gray-600 italic ml-4 mt-1">
                    Note: {item.specialInstructions}
                  </p>
                )}
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${getItemStatusColor(
                  item.itemStatus
                )}`}
              >
                {item.itemStatus}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Order Notes (if any) */}
      {order.notes && (
        <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <p className="text-sm font-semibold text-yellow-800">
            ⚠️ Special Note:
          </p>
          <p className="text-sm text-yellow-700 mt-1">{order.notes}</p>
        </div>
      )}

      {/* Action Button */}
      {order.status === "PREPARING" && (
        <button
          onClick={handleMarkAsReady}
          className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg"
        >
          Mark as Ready
        </button>
      )}
    </div>
  );
};
