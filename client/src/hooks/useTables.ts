import { useState, useMemo } from 'react';

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';

export interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  location: string; // e.g., "Main Floor", "Patio", "Private Room"
  qrCode: string | null; // Base64 or URL to QR code image
  createdAt: string;
  updatedAt: string;
}

// Mock data
const initialMockTables: Table[] = [
  {
    id: "1",
    tableNumber: 1,
    capacity: 2,
    status: "AVAILABLE",
    location: "Main Floor",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    tableNumber: 2,
    capacity: 2,
    status: "OCCUPIED",
    location: "Main Floor",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-15T14:30:00.000Z",
  },
  {
    id: "3",
    tableNumber: 3,
    capacity: 4,
    status: "AVAILABLE",
    location: "Main Floor",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "4",
    tableNumber: 4,
    capacity: 4,
    status: "RESERVED",
    location: "Main Floor",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-16T10:00:00.000Z",
  },
  {
    id: "5",
    tableNumber: 5,
    capacity: 6,
    status: "AVAILABLE",
    location: "Patio",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "6",
    tableNumber: 6,
    capacity: 6,
    status: "OCCUPIED",
    location: "Patio",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-17T12:15:00.000Z",
  },
  {
    id: "7",
    tableNumber: 7,
    capacity: 8,
    status: "AVAILABLE",
    location: "Private Room A",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "8",
    tableNumber: 8,
    capacity: 8,
    status: "RESERVED",
    location: "Private Room B",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-17T09:00:00.000Z",
  },
  {
    id: "9",
    tableNumber: 9,
    capacity: 2,
    status: "AVAILABLE",
    location: "Bar Area",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "10",
    tableNumber: 10,
    capacity: 4,
    status: "AVAILABLE",
    location: "Bar Area",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

type SortOption = 'tableNumber' | 'capacity' | 'status' | 'location';

export const useTables = () => {
  const [tables, setTables] = useState<Table[]>(initialMockTables);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TableStatus | 'ALL'>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('tableNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Get unique locations
  const locations = useMemo(() => {
    const uniqueLocations = Array.from(new Set(tables.map((t) => t.location)));
    return uniqueLocations.sort();
  }, [tables]);

  // Filter and sort tables
  const filteredAndSortedTables = useMemo(() => {
    let result = [...tables];

    // Filter by search query (table number or location)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (table) =>
          table.tableNumber.toString().includes(query) ||
          table.location.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (selectedStatus !== 'ALL') {
      result = result.filter((table) => table.status === selectedStatus);
    }

    // Filter by location
    if (selectedLocation !== 'ALL') {
      result = result.filter((table) => table.location === selectedLocation);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'tableNumber':
          comparison = a.tableNumber - b.tableNumber;
          break;
        case 'capacity':
          comparison = a.capacity - b.capacity;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'location':
          comparison = a.location.localeCompare(b.location);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tables, searchQuery, selectedStatus, selectedLocation, sortBy, sortOrder]);

  // Get statistics
  const statistics = useMemo(() => {
    return {
      total: tables.length,
      available: tables.filter((t) => t.status === 'AVAILABLE').length,
      occupied: tables.filter((t) => t.status === 'OCCUPIED').length,
      reserved: tables.filter((t) => t.status === 'RESERVED').length,
    };
  }, [tables]);

  // CRUD operations
  const createTable = (newTable: Omit<Table, 'id' | 'createdAt' | 'updatedAt' | 'qrCode'>) => {
    // Check if table number already exists
    if (tables.some((t) => t.tableNumber === newTable.tableNumber)) {
      throw new Error(`Table number ${newTable.tableNumber} already exists`);
    }

    const table: Table = {
      ...newTable,
      id: `${Date.now()}`,
      qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`, // Mock QR code
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTables((prev) => [...prev, table]);
    return table;
  };

  const updateTable = (id: string, updates: Partial<Omit<Table, 'id' | 'createdAt' | 'updatedAt' | 'qrCode'>>) => {
    // If updating table number, check it doesn't conflict
    if (updates.tableNumber !== undefined) {
      const existingTable = tables.find((t) => t.tableNumber === updates.tableNumber && t.id !== id);
      if (existingTable) {
        throw new Error(`Table number ${updates.tableNumber} already exists`);
      }
    }

    setTables((prev) =>
      prev.map((table) =>
        table.id === id
          ? { ...table, ...updates, updatedAt: new Date().toISOString() }
          : table
      )
    );
  };

  const deleteTable = (id: string) => {
    setTables((prev) => prev.filter((table) => table.id !== id));
  };

  const regenerateQRCode = (id: string) => {
    // Mock QR regeneration - in real app, this would call backend
    setTables((prev) =>
      prev.map((table) =>
        table.id === id
          ? {
              ...table,
              qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`,
              updatedAt: new Date().toISOString(),
            }
          : table
      )
    );
  };

  const updateStatus = (id: string, status: TableStatus) => {
    updateTable(id, { status });
  };

  return {
    tables: filteredAndSortedTables,
    allTables: tables,
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
  };
};
