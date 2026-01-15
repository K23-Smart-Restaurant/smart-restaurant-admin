import React from 'react';
import { Users, Receipt } from 'lucide-react';

export interface TableStatus {
  id: string;
  tableNumber: number;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BILL_REQUESTED';
  currentOrder?: {
    id: string;
    orderNumber: number;
    guestName: string | null;
    orderStatus: string;
    totalAmount: number;
  };
}

interface TableGridViewProps {
  tables: TableStatus[];
  onTableClick: (table: TableStatus) => void;
}

/**
 * TableGridView - Grid display of restaurant tables with status indicators (Light Theme)
 */
const TableGridView: React.FC<TableGridViewProps> = ({ tables, onTableClick }) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          bg: 'bg-gradient-to-br from-green-50 to-green-100',
          border: 'border-green-300',
          text: 'text-green-800',
          icon: 'text-green-600',
          badge: 'bg-green-200 text-green-800 border-green-400',
        };
      case 'OCCUPIED':
        return {
          bg: 'bg-gradient-to-br from-red-50 to-red-100',
          border: 'border-red-300',
          text: 'text-red-800',
          icon: 'text-red-600',
          badge: 'bg-red-200 text-red-800 border-red-400',
        };
      case 'RESERVED':
        return {
          bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
          border: 'border-yellow-300',
          text: 'text-yellow-800',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-200 text-yellow-800 border-yellow-400',
        };
      case 'BILL_REQUESTED':
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
          border: 'border-blue-300',
          text: 'text-blue-800',
          icon: 'text-blue-600',
          badge: 'bg-blue-200 text-blue-800 border-blue-400',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-800',
          icon: 'text-gray-600',
          badge: 'bg-gray-200 text-gray-800 border-gray-400',
        };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Available';
      case 'OCCUPIED':
        return 'Occupied';
      case 'RESERVED':
        return 'Reserved';
      case 'BILL_REQUESTED':
        return 'Bill Requested';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {tables.map((table) => {
        const styles = getStatusStyles(table.status);

        return (
          <button
            key={table.id}
            onClick={() => onTableClick(table)}
            className={`${styles.bg} border-2 ${styles.border} rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-left`}
          >
            {/* Table Number */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div>
                <h3 className={`text-xl sm:text-2xl font-bold ${styles.text}`}>Table {table.tableNumber}</h3>
                <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                  <Users className={`w-3 h-3 sm:w-4 sm:h-4 ${styles.icon}`} />
                  <span className={`text-xs ${styles.text}`}>{table.capacity} seats</span>
                </div>
              </div>
              {table.status === 'BILL_REQUESTED' && (
                <Receipt className={`w-5 h-5 sm:w-6 sm:h-6 ${styles.icon} animate-pulse`} />
              )}
            </div>

            {/* Status Badge */}
            <div
              className={`inline-block px-2 py-1 ${styles.badge} rounded text-xs font-semibold border`}
            >
              {getStatusLabel(table.status)}
            </div>

            {/* Order Info (if occupied) */}
            {table.currentOrder && table.status !== 'AVAILABLE' && (
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-current/20">
                <p className={`text-xs ${styles.text} font-medium`}>
                  Order #{table.currentOrder.orderNumber}
                </p>
                <p className={`text-xs ${styles.text} opacity-80 mt-0.5`}>
                  {table.currentOrder.guestName || 'Guest'}
                </p>
                <p className={`text-sm ${styles.text} font-bold mt-1`}>
                  ${Number(table.currentOrder.totalAmount).toFixed(2)}
                </p>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TableGridView;
