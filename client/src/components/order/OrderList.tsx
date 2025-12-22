import React, { useState, Fragment } from "react";
import { Tab } from "@headlessui/react";
import type { Order, OrderStatus } from "../../hooks/useOrders";
import { OrderCard } from "./OrderCard";

type TabStatus = "ALL" | OrderStatus;
type SortOption = "newest" | "oldest" | "table";

interface OrderListProps {
  orders: Order[];
  onUpdateStatus: (id: string, newStatus: OrderStatus) => void;
  onOrderClick: (order: Order) => void;
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  onUpdateStatus,
  onOrderClick,
}) => {
  const [activeTab, setActiveTab] = useState<TabStatus>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Filter orders by tab status
  const getFilteredOrders = () => {
    let filtered =
      activeTab === "ALL"
        ? orders
        : orders.filter((order) => order.status === activeTab);

    // Sort orders
    switch (sortBy) {
      case "newest":
        return filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "table":
        return filtered.sort((a, b) => 
          (a.tableName || `Table ${a.table?.tableNumber || 0}`).localeCompare(b.tableName || `Table ${b.table?.tableNumber || 0}`)
        );
      default:
        return filtered;
    }
  };

  // Get count for each status
  const getStatusCount = (status: TabStatus): number => {
    if (status === "ALL") return orders.length;
    return orders.filter((order) => order.status === status).length;
  };

  const tabs: { label: string; value: TabStatus }[] = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Preparing", value: "PREPARING" },
    { label: "Ready", value: "READY" },
    { label: "Served", value: "SERVED" },
  ];

  const filteredOrders = getFilteredOrders();

  return (
    <div>
      {/* Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Status Tabs */}
        <Tab.Group onChange={(index) => setActiveTab(tabs[index].value)}>
          <Tab.List className="flex flex-wrap gap-2 bg-white p-2 rounded-lg shadow">
            {tabs.map((tab) => (
              <Tab key={tab.value} as={Fragment}>
                {({ selected }) => (
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                      selected
                        ? "bg-naples text-charcoal shadow"
                        : "text-gray-600 hover:bg-antiflash hover:text-charcoal"
                    }`}
                  >
                    {tab.label} ({getStatusCount(tab.value)})
                  </button>
                )}
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="sort"
            className="text-sm font-medium text-charcoal whitespace-nowrap"
          >
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-naples focus:border-naples text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="table">Table Number</option>
          </select>
        </div>
      </div>

      {/* Result Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredOrders.length}</span>{" "}
          order{filteredOrders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Order Grid */}
      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={onUpdateStatus}
              onClick={() => onOrderClick(order)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No orders found</p>
          <p className="text-gray-400 text-sm mt-2">
            {activeTab === "ALL"
              ? "There are no orders yet"
              : `There are no orders with status "${activeTab}"`}
          </p>
        </div>
      )}
    </div>
  );
};
