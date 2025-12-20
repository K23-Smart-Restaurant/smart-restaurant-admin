import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tableService, type Table, type TableStatus, type CreateTableDto, type UpdateTableDto } from '../services/tableService';

// Re-export types
export type { Table, TableStatus };

export const useTables = () => {
  const queryClient = useQueryClient();

  // Fetch all tables
  const {
    data: tables = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tables'],
    queryFn: tableService.getAll,
  });

  // Create table mutation
  const createMutation = useMutation({
    mutationFn: tableService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  // Update table mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTableDto }) =>
      tableService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  // Delete table mutation
  const deleteMutation = useMutation({
    mutationFn: tableService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  // Regenerate QR code mutation
  const regenerateQRMutation = useMutation({
    mutationFn: tableService.regenerateQR,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TableStatus }) =>
      tableService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  // Helper functions
  const createTable = (data: CreateTableDto) => {
    return createMutation.mutateAsync(data);
  };

  const updateTable = (id: string, data: UpdateTableDto) => {
    return updateMutation.mutateAsync({ id, data });
  };

  const deleteTable = (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  const regenerateQRCode = (id: string) => {
    return regenerateQRMutation.mutateAsync(id);
  };

  const updateStatus = (id: string, status: TableStatus) => {
    return updateStatusMutation.mutateAsync({ id, status });
  };

  // Get QR code download URL
  const getQRCodeUrl = (id: string) => {
    return tableService.getQRCodeUrl(id);
  };

  // Statistics
  const statistics = {
    total: tables.length,
    available: tables.filter((t) => t.status === 'AVAILABLE').length,
    occupied: tables.filter((t) => t.status === 'OCCUPIED').length,
    reserved: tables.filter((t) => t.status === 'RESERVED').length,
  };

  return {
    tables,
    allTables: tables,
    statistics,
    isLoading,
    isError,
    error,
    refetch,
    createTable,
    updateTable,
    deleteTable,
    regenerateQRCode,
    updateStatus,
    getQRCodeUrl,
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isRegeneratingQR: regenerateQRMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
};
