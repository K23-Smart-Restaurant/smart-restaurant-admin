import React, { useState } from 'react';
import { 
  PencilIcon, 
  Trash2Icon, 
  QrCodeIcon, 
  UsersIcon, 
  MapPinIcon,
  RefreshCwIcon 
} from 'lucide-react';
import type { Table, TableStatus } from '../../hooks/useTables';
import { Modal } from '../common/Modal';
import { QRCodeDisplay } from './QRCodeDisplay';

interface TableListProps {
  tables: Table[];
  onEdit: (table: Table) => void;
  onDelete: (table: Table) => void;
  onRegenerateQR: (tableId: string) => void;
  onUpdateStatus: (tableId: string, status: TableStatus) => void;
}

export const TableList: React.FC<TableListProps> = ({
  tables,
  onEdit,
  onDelete,
  onRegenerateQR,
  onUpdateStatus,
}) => {
  const [selectedTableForQR, setSelectedTableForQR] = useState<Table | null>(null);

  const handleDelete = (table: Table) => {
    if (confirm(`Are you sure you want to delete Table ${table.tableNumber}? This action cannot be undone.`)) {
      onDelete(table);
    }
  };

  const handleQuickRegenerate = (e: React.MouseEvent, table: Table) => {
    e.stopPropagation();
    if (confirm(`Regenerate QR code for Table ${table.tableNumber}? The old QR code will be invalidated.`)) {
      onRegenerateQR(table.id);
      alert(`QR code regenerated for Table ${table.tableNumber}`);
    }
  };

  const getStatusColor = (status: TableStatus) => {
    const colors = {
      AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
      OCCUPIED: 'bg-red-100 text-red-800 border-red-200',
      RESERVED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[status];
  };

  const getStatusLabel = (status: TableStatus) => {
    const labels = {
      AVAILABLE: 'Available',
      OCCUPIED: 'Occupied',
      RESERVED: 'Reserved',
    };
    return labels[status];
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => (
          <div
            key={table.id}
            className="bg-white rounded-lg shadow-md border-2 border-white hover:border-naples/80 hover:shadow-lg hover:shadow-naples/30 transition-all duration-200 overflow-hidden group"
          >
            {/* Header with table number */}
            <div className="bg-charcoal text-white p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-naples flex items-center justify-center text-charcoal font-bold text-xl mr-3">
                  {table.tableNumber}
                </div>
                <div>
                  <h3 className="text-lg font-bold">Table {table.tableNumber}</h3>
                  <p className="text-xs text-antiflash opacity-90">{table.location}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(table.status)}`}>
                  {getStatusLabel(table.status)}
                </span>
                <div className="flex items-center text-sm text-gray-600">
                  <UsersIcon className="w-4 h-4 mr-1" />
                  {table.capacity} seats
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{table.location}</span>
              </div>

              {/* Quick Status Update */}
              <div className="pt-2 border-t border-antiflash">
                <p className="text-xs text-gray-600 mb-2">Quick Status:</p>
                <div className="flex gap-1">
                  {(['AVAILABLE', 'OCCUPIED', 'RESERVED'] as TableStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => onUpdateStatus(table.id, status)}
                      className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                        table.status === status
                          ? getStatusColor(status)
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={`Set to ${getStatusLabel(status)}`}
                    >
                      {status === 'AVAILABLE' ? 'Avail' : status === 'OCCUPIED' ? 'Occup' : 'Reserv'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-antiflash grid grid-cols-2 gap-2">
                {/* QR Code Button */}
                <button
                  onClick={() => setSelectedTableForQR(table)}
                  className="flex items-center justify-center px-3 py-2 bg-naples hover:bg-naples/80 text-charcoal rounded-md text-sm font-medium transition-colors"
                  title="View QR Code"
                >
                  <QrCodeIcon className="w-4 h-4 mr-1" />
                  QR Code
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => onEdit(table)}
                  className="flex items-center justify-center px-3 py-2 bg-gray-200 hover:bg-gray-300 text-charcoal rounded-md text-sm font-medium transition-colors"
                  title="Edit table"
                >
                  <PencilIcon className="w-4 h-4 mr-1" />
                  Edit
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => handleQuickRegenerate(e, table)}
                  className="flex-1 flex items-center justify-center px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium transition-colors"
                  title="Regenerate QR code"
                >
                  <RefreshCwIcon className="w-3 h-3 mr-1" />
                  Regen QR
                </button>
                <button
                  onClick={() => handleDelete(table)}
                  className="flex-1 flex items-center justify-center px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded text-xs font-medium transition-colors"
                  title="Delete table"
                >
                  <Trash2Icon className="w-3 h-3 mr-1" />
                  Delete
                </button>
              </div>
            </div>

            {/* Footer - Last Updated */}
            <div className="bg-antiflash/50 px-4 py-2 text-xs text-gray-600">
              Updated: {new Date(table.updatedAt).toLocaleDateString()}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {tables.length === 0 && (
          <div className="col-span-full bg-white rounded-lg shadow-md border border-antiflash p-12 text-center">
            <p className="text-gray-600 mb-2">No tables found</p>
            <p className="text-sm text-gray-500">
              Create your first table to get started or adjust your filters
            </p>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedTableForQR && (
        <Modal
          isOpen={!!selectedTableForQR}
          onClose={() => setSelectedTableForQR(null)}
          title={`QR Code - Table ${selectedTableForQR.tableNumber}`}
          size="md"
        >
          <QRCodeDisplay
            table={selectedTableForQR}
            onRegenerateQR={(tableId) => {
              onRegenerateQR(tableId);
              // Keep modal open to show new QR code
            }}
          />
        </Modal>
      )}
    </>
  );
};
