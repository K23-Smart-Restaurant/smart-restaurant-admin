import { api, apiClient } from "./api";

export type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED";

export type QRTokenStatus = "active" | "invalid" | "none";

export interface QRStatus {
  status: QRTokenStatus;
  label: string;
  isActive: boolean;
  error?: string;
  createdAt?: string;
  expiresAt?: string;
  daysUntilExpiry?: number;
}

export interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  location: string;
  description?: string | null;
  status: TableStatus;
  qrCode: string | null;
  qrToken: string | null;
  qrTokenCreatedAt: string | null;
  qrStatus?: QRStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTableDto {
  tableNumber: number;
  capacity: number;
  location: string;
  description?: string;
  status?: TableStatus;
}

export interface UpdateTableDto {
  tableNumber?: number;
  capacity?: number;
  location?: string;
  description?: string;
  status?: TableStatus;
}

export interface BatchDownloadOptions {
  tableIds?: string[];
  format: "zip" | "pdf";
  layout?: "single" | "multiple";
  restaurantName?: string;
  includeWifi?: boolean;
  wifiName?: string;
  wifiPassword?: string;
}

export interface BulkRegenerateResult {
  message: string;
  results: {
    success: Array<{ tableId: string; tableNumber: number }>;
    failed: Array<{ tableId: string; error: string }>;
    total: number;
  };
}

export const tableService = {
  // Get all tables
  getAll: async (): Promise<Table[]> => {
    const response = await apiClient.get<
      { success: boolean; data: Table[] } | Table[]
    >("/tables");
    // Handle both response formats
    if ("data" in response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return response.data as Table[];
  },

  // Create a new table
  create: async (data: CreateTableDto): Promise<Table> => {
    const response = await apiClient.post<
      { success: boolean; data: Table } | Table
    >("/tables", data);
    if ("data" in response.data && "id" in response.data.data) {
      return response.data.data;
    }
    return response.data as Table;
  },

  // Update an existing table
  update: async (id: string, data: UpdateTableDto): Promise<Table> => {
    const response = await apiClient.patch<
      { success: boolean; data: Table } | Table
    >(`/tables/${id}`, data);
    if ("data" in response.data && "id" in response.data.data) {
      return response.data.data;
    }
    return response.data as Table;
  },

  // Delete a table
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tables/${id}`);
  },

  // Regenerate QR code for a table
  regenerateQR: async (id: string): Promise<Table> => {
    const response = await apiClient.post<
      { success: boolean; data: Table } | Table
    >(`/tables/${id}/regenerate-qr`);
    if ("data" in response.data && "id" in response.data.data) {
      return response.data.data;
    }
    return response.data as Table;
  },

  // Get QR code download URL
  getQRCodeUrl: (id: string, format: "png" | "pdf" = "png"): string => {
    return `${api.defaults.baseURL}/tables/${id}/qr-code?format=${format}`;
  },

  // Download QR code as blob
  downloadQRCode: async (
    id: string,
    format: "png" | "pdf" = "png"
  ): Promise<Blob> => {
    const response = await api.get(`/tables/${id}/qr-code`, {
      params: { format },
      responseType: "blob",
    });
    return response.data;
  },

  // Batch download QR codes
  downloadBatchQR: async (options: BatchDownloadOptions): Promise<Blob> => {
    const response = await api.post("/tables/batch/download", options, {
      responseType: "blob",
    });
    return response.data;
  },

  // Bulk regenerate QR codes
  bulkRegenerateQR: async (
    tableIds?: string[]
  ): Promise<BulkRegenerateResult> => {
    const response = await apiClient.post<BulkRegenerateResult>(
      "/tables/batch/regenerate",
      {
        tableIds,
      }
    );
    return response.data;
  },

  // Update table status
  updateStatus: async (id: string, status: TableStatus): Promise<Table> => {
    const response = await apiClient.patch<
      { success: boolean; data: Table } | Table
    >(`/tables/${id}`, { status });
    if ("data" in response.data && "id" in response.data.data) {
      return response.data.data;
    }
    return response.data as Table;
  },

  // Validate QR token (public endpoint)
  validateQRToken: async (
    token: string
  ): Promise<{
    valid: boolean;
    data?: {
      tableId: string;
      restaurantId: string;
      table?: {
        id: string;
        tableNumber: number;
        status: TableStatus;
        location: string;
        capacity: number;
      };
    };
    error?: string;
  }> => {
    const response = await api.get("/tables/validate-qr", {
      params: { token },
    });
    return response.data;
  },
};
