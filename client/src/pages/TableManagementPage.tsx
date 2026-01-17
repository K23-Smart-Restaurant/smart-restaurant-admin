import React, { useState } from 'react';
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  ArrowUpDownIcon,
  LayoutGrid,
  Check,
  Users,
  Calendar,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTables } from '../hooks/useTables';
import type { Table, TableStatus } from '../hooks/useTables';
import { TableList } from '../components/table/TableList';
import { TableForm } from '../components/table/TableForm';
import { BatchQROperations } from '../components/table/BatchQROperations';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { ConfirmDeleteDialog } from '../components/common/ConfirmDeleteDialog';
import { PageLoading } from '../components/common/LoadingSpinner';
import { useToastContext } from '../contexts/ToastContext';

const TableManagementPage: React.FC = () => {
  const { t } = useTranslation(['tables', 'common']);
  const { showSuccess, showError } = useToastContext();

  const {
    tables: allTables,
    statistics,
    isLoading,
    isError,
    refetch,
    createTable,
    updateTable,
    deleteTable,
    regenerateQRCode,
    updateStatus,
    toggleActive,
  } = useTables();

  // Local filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TableStatus | 'ALL'>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'tableNumber' | 'capacity' | 'status' | 'createdAt'>(
    'tableNumber'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  // Delete confirmation state
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Apply filters and sorting
  const tables = React.useMemo(() => {
    let filtered = Array.isArray(allTables) ? [...allTables] : [];

    const locationMatches = (location: string) => {
      if (selectedLocation === 'ALL') return true;
      return location === selectedLocation;
    };

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((t) => t.tableNumber.toString().includes(searchQuery));
    }

    // Status filter
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter((t) => t.status === selectedStatus);
    }

    // Location filter
    filtered = filtered.filter((t) => locationMatches(t.location));

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'tableNumber') comparison = a.tableNumber - b.tableNumber;
      else if (sortBy === 'capacity') comparison = a.capacity - b.capacity;
      else if (sortBy === 'status') comparison = a.status.localeCompare(b.status);
      else if (sortBy === 'createdAt')
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [allTables, searchQuery, selectedStatus, selectedLocation, sortBy, sortOrder]);

  const uniqueLocations = React.useMemo(
    () =>
      Array.from(
        new Set(
          (allTables || []).map((t) => t.location).filter((loc): loc is string => !!loc?.trim())
        )
      ).sort(),
    [allTables]
  );

  const handleAddTable = async (
    tableData: Omit<
      Table,
      'id' | 'createdAt' | 'updatedAt' | 'qrCode' | 'qrToken' | 'qrTokenCreatedAt'
    >
  ) => {
    try {
      // Convert data to match DTO types (handle null -> undefined for description)
      const dto = {
        tableNumber: tableData.tableNumber,
        capacity: tableData.capacity,
        location: tableData.location,
        description: tableData.description ?? undefined,
        status: tableData.status,
      };

      if (editingTable) {
        await updateTable(editingTable.id, dto);
        showSuccess(
          t('common:success'),
          t('tables:messages.updated', { number: tableData.tableNumber })
        );
      } else {
        await createTable(dto);
        showSuccess(
          t('common:success'),
          t('tables:messages.created', { number: tableData.tableNumber })
        );
      }
      closeTableModal();
    } catch (error) {
      console.error('Error saving table:', error);
      const errorMessage = error instanceof Error ? error.message : t('tables:errors.unexpected');
      showError(t('tables:errors.saveFailed'), errorMessage);
    }
  };

  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    setIsTableModalOpen(true);
  };

  const handleDeleteTable = async (table: Table) => {
    setTableToDelete(table);
  };

  const confirmDelete = async () => {
    if (!tableToDelete) return;

    setIsDeleting(true);

    try {
      await deleteTable(tableToDelete.id);
      showSuccess(
        t('common:success'),
        t('tables:messages.deleted', { number: tableToDelete.tableNumber })
      );
      setTableToDelete(null);
    } catch (error) {
      console.error('Error deleting table:', error);
      const errorMessage = error instanceof Error ? error.message : t('tables:errors.unexpected');
      showError(t('tables:errors.deleteFailed'), errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setTableToDelete(null);
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

  // Show loading state
  if (isLoading) {
    return <PageLoading message={t('tables:loading.tables')} />;
  }

  // Show error state
  if (isError) {
    return (
      <div className="p-6 text-center border border-red-200 rounded-lg bg-red-50">
        <p className="mb-4 text-red-600">{t('tables:errors.loadFailed')}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          {t('tables:loading.retry')}
        </button>
      </div>
    );
  }

  const statusOptions: Array<{ value: TableStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: t('tables:status.all') },
    { value: 'AVAILABLE', label: t('tables:status.available') },
    { value: 'OCCUPIED', label: t('tables:status.occupied') },
    { value: 'RESERVED', label: t('tables:status.reserved') },
  ];

  const sortOptions: Array<{ value: typeof sortBy; label: string }> = [
    { value: 'tableNumber', label: t('tables:sort.tableNumber') },
    { value: 'capacity', label: t('tables:sort.capacity') },
    { value: 'status', label: t('tables:sort.status') },
    { value: 'createdAt', label: t('tables:sort.createdAt') },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">{t('tables:title')}</h1>
          <p className="mt-1 text-gray-600">{t('tables:subtitle')}</p>
        </div>

        {/* Add Table button */}
        <Button onClick={openAddTableModal} icon={PlusIcon}>
          {t('tables:actions.addTable')}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white border rounded-lg shadow-md border-antiflash">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('tables:statistics.total')}</p>
              <p className="text-2xl font-bold text-charcoal">{statistics.total}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
              <LayoutGrid className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow-md border-antiflash">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('tables:statistics.available')}</p>
              <p className="text-2xl font-bold text-green-600">{statistics.available}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow-md border-antiflash">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('tables:statistics.occupied')}</p>
              <p className="text-2xl font-bold text-red-600">{statistics.occupied}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
              <Users className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow-md border-antiflash">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('tables:statistics.reserved')}</p>
              <p className="text-2xl font-bold text-yellow-600">{statistics.reserved}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-4 mb-6 bg-white border rounded-lg shadow-md border-antiflash">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block mb-2 text-sm font-medium text-charcoal">
              <SearchIcon className="inline w-4 h-4 mr-1" />
              {t('tables:search.label')}
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tables:search.placeholder')}
              className="w-full px-4 py-2 text-black bg-gray-200 border rounded-md border-antiflash focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block mb-2 text-sm font-medium text-charcoal">
              <FilterIcon className="inline w-4 h-4 mr-1" />
              {t('tables:filters.status')}
            </label>
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as TableStatus | 'ALL')}
              className="w-full px-4 py-2 text-black bg-gray-200 border rounded-md border-antiflash focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none"
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
            <label htmlFor="location" className="block mb-2 text-sm font-medium text-charcoal">
              <FilterIcon className="inline w-4 h-4 mr-1" />
              {t('tables:filters.location')}
            </label>
            <select
              id="location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value as string | 'ALL')}
              className="w-full px-4 py-2 text-black bg-gray-200 border rounded-md border-antiflash focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none"
            >
              <option value="ALL">{t('tables:locations.all')}</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort" className="block mb-2 text-sm font-medium text-charcoal">
              <ArrowUpDownIcon className="inline w-4 h-4 mr-1" />
              {t('tables:filters.sortBy')}
            </label>
            <div className="flex gap-2">
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="flex-1 px-4 py-2 text-black bg-gray-200 border rounded-md border-antiflash focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={toggleSortOrder}
                className="px-3 py-2 transition-colors bg-gray-200 border rounded-md hover:bg-gray-300 text-charcoal border-antiflash"
                title={t(`tables:filters.sort${sortOrder === 'asc' ? 'Asc' : 'Desc'}`)}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Batch QR Operations */}
      <BatchQROperations
        tables={tables}
        selectedTableIds={selectedTableIds}
        onBulkRegenerateComplete={() => {
          refetch();
          setSelectedTableIds([]);
        }}
      />

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          {t('tables:results.showing')}{' '}
          <span className="font-semibold text-charcoal">{tables.length}</span>{' '}
          {t(`tables:results.table${tables.length !== 1 ? '_plural' : ''}`)}
        </p>
      </div>

      {/* Table List */}
      <TableList
        tables={tables}
        onEdit={handleEditTable}
        onDelete={handleDeleteTable}
        onRegenerateQR={async (tableId: string) => {
          await regenerateQRCode(tableId);
        }}
        onUpdateStatus={updateStatus}
        onToggleActive={toggleActive}
      />

      {/* Create/Edit Table Modal */}
      <Modal
        isOpen={isTableModalOpen}
        onClose={closeTableModal}
        title={editingTable ? t('tables:modals.edit') : t('tables:modals.create')}
      >
        <TableForm
          table={editingTable || undefined}
          onSubmit={handleAddTable}
          onCancel={closeTableModal}
          existingLocations={uniqueLocations}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={tableToDelete !== null}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={t('tables:modals.delete')}
        itemName={
          tableToDelete ? t('tables:list.table', { number: tableToDelete.tableNumber }) : undefined
        }
        message={t('tables:modals.deleteMessage')}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default TableManagementPage;
