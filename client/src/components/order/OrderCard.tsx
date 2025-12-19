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
    if (isOverdue) return "border-l-4 border-red-500 shadow-lg shadow-red-500/20 animate-pulse-glow";
    switch (order.status) {
      case "PENDING":
        return "border-l-4 border-yellow-400 shadow-md hover:shadow-lg hover:shadow-yellow-400/20";
      case "CONFIRMED":
        return "border-l-4 border-blue-400 shadow-md hover:shadow-lg hover:shadow-blue-400/20";
      case "PREPARING":
        return "border-l-4 border-gradient-primary shadow-md hover:shadow-glow";
      case "READY":
        return "border-l-4 border-green-500 shadow-md hover:shadow-lg hover:shadow-green-500/20";
      case "SERVED":
        return "border-l-4 border-gray-400 shadow-md";
      default:
        return "border-l-4 border-gray-300 shadow-md";
    }
  };

  // Get status badge color
  const getStatusBadgeColor = () => {
    switch (order.status) {
      case "PENDING":
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 shadow-sm";
      case "CONFIRMED":
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm";
      case "PREPARING":
        return "bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white shadow-glow";
      case "READY":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md animate-pulse-glow";
      case "SERVED":
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-sm";
      case "PAID":
        return "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md";
      case "CANCELLED":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm";
      default:
        return "bg-gray-100 text-gray-800 shadow-sm";
    }
  };

  // Get payment status badge color
  const getPaymentBadgeColor = () => {
    switch (order.paymentStatus) {
      case "PAID":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm";
      case "PENDING":
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 shadow-sm";
      case "UNPAID":
        return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 shadow-sm";
      case "FAILED":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm";
      default:
        return "bg-gray-100 text-gray-800 shadow-sm";
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
