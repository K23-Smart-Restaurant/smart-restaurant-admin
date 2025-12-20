import { useState, useMemo } from 'react';

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';

export interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  location: string; // e.g., "Main Floor", "Patio", "Private Room"
  description?: string | null; // Optional additional notes
  status: TableStatus;
  qrCode: string | null; // Base64 QR code image (cached)
  qrToken: string | null; // JWT token for table access
  qrTokenCreatedAt: string | null; // When the QR token was generated
  createdAt: string;
  updatedAt: string;
}

// Mock data
const initialMockTables: Table[] = [
  {
    id: "1",
    tableNumber: 1,
    capacity: 2,
    location: "Main Floor",
    description: null,
    status: "AVAILABLE",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    qrToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0YWJsZUlkIjoiMSJ9.mock",
    qrTokenCreatedAt: "2024-01-01T00:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    tableNumber: 2,
    capacity: 2,
    location: "Main Floor",
    description: "Near the window",
    status: "OCCUPIED",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    qrToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0YWJsZUlkIjoiMiJ9.mock",
    qrTokenCreatedAt: "2024-01-15T14:30:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-15T14:30:00.000Z",
  },
  {
    id: "3",
    tableNumber: 3,
    capacity: 4,
    location: "Main Floor",
    description: null,
    status: "AVAILABLE",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    qrToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0YWJsZUlkIjoiMyJ9.mock",
    qrTokenCreatedAt: "2024-01-01T00:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "4",
    tableNumber: 4,
    capacity: 4,
    location: "Main Floor",
    description: "Corner table",
    status: "RESERVED",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    qrToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0YWJsZUlkIjoiNCJ9.mock",
    qrTokenCreatedAt: "2024-01-16T10:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-16T10:00:00.000Z",
  },
  {
    id: "5",
    tableNumber: 5,
    capacity: 6,
    location: "Patio",
    description: "Outdoor seating",
    status: "AVAILABLE",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    qrToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0YWJsZUlkIjoiNSJ9.mock",
    qrTokenCreatedAt: "2024-01-01T00:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "6",
    tableNumber: 6,
    capacity: 6,
    location: "Patio",
    description: null,
    status: "OCCUPIED",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    qrToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0YWJsZUlkIjoiNiJ9.mock",
    qrTokenCreatedAt: "2024-01-17T12:15:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-17T12:15:00.000Z",
  },
  {
    id: "7",
    tableNumber: 7,
    capacity: 8,
    location: "Private Room A",
    description: "Private dining room",
    status: "AVAILABLE",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    qrToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0YWJsZUlkIjoiNyJ9.mock",
    qrTokenCreatedAt: "2024-01-01T00:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "8",
    tableNumber: 8,
    capacity: 8,
    location: "Private Room B",
    description: "VIP area with projector",
    status: "RESERVED",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    qrToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0YWJsZUlkIjoiOCJ9.mock",
    qrTokenCreatedAt: "2024-01-17T09:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-17T09:00:00.000Z",
  },
  {
    id: "9",
    tableNumber: 9,
    capacity: 2,
    location: "Bar Area",
    description: null,
    status: "AVAILABLE",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    qrToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0YWJsZUlkIjoiOSJ9.mock",
    qrTokenCreatedAt: "2024-01-01T00:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "10",
    tableNumber: 10,
    capacity: 4,
    location: "Bar Area",
    description: "High top table",
    status: "AVAILABLE",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    qrToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0YWJsZUlkIjoiMTAifQ.mock",
    qrTokenCreatedAt: "2024-01-01T00:00:00.000Z",
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
  const createTable = (newTable: Omit<Table, 'id' | 'createdAt' | 'updatedAt' | 'qrCode' | 'qrToken' | 'qrTokenCreatedAt'>) => {
    // Check if table number already exists
    if (tables.some((t) => t.tableNumber === newTable.tableNumber)) {
      throw new Error(`Table number ${newTable.tableNumber} already exists`);
    }

    const table: Table = {
      ...newTable,
      id: `${Date.now()}`,
      qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`, // Mock QR code
      qrToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0YWJsZUlkIjoiJHtEYXRlLm5vdygpfSJ9.mock`, // Mock token
      qrTokenCreatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTables((prev) => [...prev, table]);
    return table;
  };

  const updateTable = (id: string, updates: Partial<Omit<Table, 'id' | 'createdAt' | 'updatedAt' | 'qrCode' | 'qrToken' | 'qrTokenCreatedAt'>>) => {
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
              qrToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0YWJsZUlkIjoiJHtpZH0iLCJ0aW1lc3RhbXAiOiIke0RhdGUubm93KCl9In0.mock`,
              qrTokenCreatedAt: new Date().toISOString(),
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
