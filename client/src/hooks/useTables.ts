import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  tableService,
  type Table,
  type TableStatus,
  type CreateTableDto,
  type UpdateTableDto,
  type BatchDownloadOptions,
  type QRStatus,
  type ActiveOrdersCheckResult,
  type ToggleActiveResult,
} from "../services/tableService";

// Re-export types
export type {
  Table,
  TableStatus,
  QRStatus,
  ActiveOrdersCheckResult,
  ToggleActiveResult,
};

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
    queryKey: ["tables"],
    queryFn: tableService.getAll,
  });

  // Create table mutation
  const createMutation = useMutation({
    mutationFn: tableService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });

  // Update table mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTableDto }) =>
      tableService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });

  // Delete table mutation
  const deleteMutation = useMutation({
    mutationFn: tableService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });

  // Regenerate QR code mutation
  const regenerateQRMutation = useMutation({
    mutationFn: tableService.regenerateQR,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });

  // Bulk regenerate QR codes mutation
  const bulkRegenerateQRMutation = useMutation({
    mutationFn: tableService.bulkRegenerateQR,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TableStatus }) =>
      tableService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });

  // M5 & M6: Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({
      id,
      isActive,
      force,
    }: {
      id: string;
      isActive: boolean;
      force?: boolean;
    }) => tableService.toggleActive(id, isActive, force),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["tables"] });
      }
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

  const bulkRegenerateQRCodes = (tableIds?: string[]) => {
    return bulkRegenerateQRMutation.mutateAsync(tableIds);
  };

  const updateStatus = (id: string, status: TableStatus) => {
    return updateStatusMutation.mutateAsync({ id, status });
  };

  // M6: Check for active orders before deactivating
  const checkActiveOrders = (id: string) => {
    return tableService.checkActiveOrders(id);
  };

  // M5 & M6: Toggle table active status with warning support
  const toggleActive = (id: string, isActive: boolean, force?: boolean) => {
    return toggleActiveMutation.mutateAsync({ id, isActive, force });
  };

  // Get QR code download URL
  const getQRCodeUrl = (id: string, format: "png" | "pdf" = "png") => {
    return tableService.getQRCodeUrl(id, format);
  };

  // Download QR code
  const downloadQRCode = (id: string, format: "png" | "pdf" = "png") => {
    return tableService.downloadQRCode(id, format);
  };

  // Batch download QR codes
  const downloadBatchQRCodes = (options: BatchDownloadOptions) => {
    return tableService.downloadBatchQR(options);
  };

  // Statistics
  const statistics = {
    total: tables.length,
    available: tables.filter((t) => t.status === "AVAILABLE").length,
    occupied: tables.filter((t) => t.status === "OCCUPIED").length,
    reserved: tables.filter((t) => t.status === "RESERVED").length,
    active: tables.filter((t) => t.isActive !== false).length,
    inactive: tables.filter((t) => t.isActive === false).length,
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
    bulkRegenerateQRCodes,
    updateStatus,
    checkActiveOrders,
    toggleActive,
    getQRCodeUrl,
    downloadQRCode,
    downloadBatchQRCodes,
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isRegeneratingQR: regenerateQRMutation.isPending,
    isBulkRegeneratingQR: bulkRegenerateQRMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isTogglingActive: toggleActiveMutation.isPending,
  };
};
