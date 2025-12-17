import React, { useState } from 'react';
import { PlusIcon, SearchIcon, FilterIcon, ArrowUpDownIcon } from 'lucide-react';
import { useTables } from '../hooks/useTables';
import type { Table, TableStatus } from '../hooks/useTables';
import { TableList } from '../components/table/TableList';
import { TableForm } from '../components/table/TableForm';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';

const TableManagementPage: React.FC = () => {
  const {
    tables,
    locations,
    statistics,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedLocation,
    setSelectedLocation,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    createTable,
    updateTable,
    deleteTable,
    regenerateQRCode,
    updateStatus,
  } = useTables();

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const handleAddTable = (tableData: Omit<Table, 'id' | 'createdAt' | 'updatedAt' | 'qrCode'>) => {
    try {
      if (editingTable) {
        // Update existing table
        updateTable(editingTable.id, tableData);
        alert('Table updated successfully!');
      } else {
        // Add new table
        createTable(tableData);
        alert('Table created successfully!');
      }
      closeTableModal();
    } catch (error) {
      // Error already shown by the hook
    }
  };

  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    setIsTableModalOpen(true);
  };

  const handleDeleteTable = (table: Table) => {
    deleteTable(table.id);
  };

  const closeTableModal = () => {
    setIsTableModalOpen(false);
    setEditingTable(null);
  };

  const openAddTableModal = () => {
    setEditingTable(null);
    setIsTableModalOpen(true);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const statusOptions: Array<{ value: TableStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'OCCUPIED', label: 'Occupied' },
    { value: 'RESERVED', label: 'Reserved' },
  ];

  const sortOptions: Array<{ value: typeof sortBy; label: string }> = [
    { value: 'tableNumber', label: 'Table Number' },
    { value: 'capacity', label: 'Capacity' },
    { value: 'status', label: 'Status' },
    { value: 'location', label: 'Location' },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Tables</h1>
          <p className="text-gray-600 mt-1">Manage restaurant tables and QR codes</p>
        </div>

        {/* Add Table button */}
        <Button onClick={openAddTableModal} icon={PlusIcon}>
          Add Table
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md border border-antiflash p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tables</p>
              <p className="text-2xl font-bold text-charcoal">{statistics.total}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl">🏪</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-antiflash p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{statistics.available}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-antiflash p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-red-600">{statistics.occupied}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-antiflash p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reserved</p>
              <p className="text-2xl font-bold text-yellow-600">{statistics.reserved}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md border border-antiflash p-4 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-charcoal mb-2">
              <SearchIcon className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Table number or location..."
              className="w-full bg-gray-200 text-black px-4 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-charcoal mb-2">
              <FilterIcon className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as TableStatus | 'ALL')}
              className="w-full bg-gray-200 text-black px-4 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-charcoal mb-2">
              <FilterIcon className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <select
              id="location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-gray-200 text-black px-4 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none"
            >
              <option value="ALL">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-charcoal mb-2">
              <ArrowUpDownIcon className="w-4 h-4 inline mr-1" />
              Sort By
            </label>
            <div className="flex gap-2">
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="flex-1 bg-gray-200 text-black px-4 py-2 border border-antiflash rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={toggleSortOrder}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-charcoal border border-antiflash rounded-md transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-600">Active filters:</span>
          {searchQuery && (
            <span className="px-2 py-1 bg-naples/20 text-charcoal text-xs rounded-full">
              Search: "{searchQuery}"
            </span>
          )}
          {selectedStatus !== 'ALL' && (
            <span className="px-2 py-1 bg-naples/20 text-charcoal text-xs rounded-full">
              Status: {statusOptions.find((s) => s.value === selectedStatus)?.label}
            </span>
          )}
          {selectedLocation !== 'ALL' && (
            <span className="px-2 py-1 bg-naples/20 text-charcoal text-xs rounded-full">
              Location: {selectedLocation}
            </span>
          )}
          <span className="px-2 py-1 bg-gray-200 text-charcoal text-xs rounded-full">
            Sort: {sortOptions.find((s) => s.value === sortBy)?.label} ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
          </span>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-charcoal">{tables.length}</span> table{tables.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table List */}
      <TableList
        tables={tables}
        onEdit={handleEditTable}
        onDelete={handleDeleteTable}
        onRegenerateQR={regenerateQRCode}
        onUpdateStatus={updateStatus}
      />

      {/* Create/Edit Table Modal */}
      <Modal
        isOpen={isTableModalOpen}
        onClose={closeTableModal}
        title={editingTable ? 'Edit Table' : 'Create Table'}
      >
        <TableForm
          table={editingTable || undefined}
          onSubmit={handleAddTable}
          onCancel={closeTableModal}
          existingLocations={locations}
        />
      </Modal>
    </div>
  );
};

export default TableManagementPage;
