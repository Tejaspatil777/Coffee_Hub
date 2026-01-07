import axiosClient from './axiosClient';
import { TableResponse, TableQRResponse, TableStatus } from './types';

/**
 * Table API
 * Handles restaurant table management
 * All endpoints return data directly (ApiResponse wrapper handled by axios interceptor)
 */
export const tableApi = {
  /**
   * Get all tables
   * GET /tables
   */
  getAllTables: async (): Promise<TableResponse[]> => {
    const response = await axiosClient.get<TableResponse[]>('/tables');
    return response.data;
  },

  /**
   * Get available tables
   * GET /tables/available
   */
  getAvailableTables: async (): Promise<TableResponse[]> => {
    const response = await axiosClient.get<TableResponse[]>('/tables/available');
    return response.data;
  },

  /**
   * Get available tables with minimum capacity
   * GET /tables/available/capacity?minCapacity={capacity}
   */
  getAvailableTablesWithCapacity: async (minCapacity: number): Promise<TableResponse[]> => {
    const response = await axiosClient.get<TableResponse[]>('/tables/available/capacity', {
      params: { minCapacity },
    });
    return response.data;
  },

  /**
   * Get table by ID
   * GET /tables/{id}
   */
  getTableById: async (id: number): Promise<TableResponse> => {
    const response = await axiosClient.get<TableResponse>(`/tables/${id}`);
    return response.data;
  },

  /**
   * Get table by token
   * GET /tables/token/{tableToken}
   */
  getTableByToken: async (tableToken: string): Promise<TableResponse> => {
    const response = await axiosClient.get<TableResponse>(`/tables/token/${tableToken}`);
    return response.data;
  },

  /**
   * Search tables (Admin only)
   * GET /tables/search?query={query}
   */
  searchTables: async (query: string): Promise<TableResponse[]> => {
    const response = await axiosClient.get<TableResponse[]>('/tables/search', {
      params: { query },
    });
    return response.data;
  },

  /**
   * Create new table (Admin only)
   * POST /tables
   */
  createTable: async (table: Partial<TableResponse>): Promise<TableResponse> => {
    const response = await axiosClient.post<TableResponse>('/tables', table);
    return response.data;
  },

  /**
   * Update table (Admin only)
   * PUT /tables/{id}
   */
  updateTable: async (id: number, table: Partial<TableResponse>): Promise<TableResponse> => {
    const response = await axiosClient.put<TableResponse>(`/tables/${id}`, table);
    return response.data;
  },

  /**
   * Delete table (Admin only)
   * DELETE /tables/{id}
   */
  deleteTable: async (id: number): Promise<void> => {
    await axiosClient.delete(`/tables/${id}`);
  },

  /**
   * Generate QR code for table (Admin only)
   * POST /tables/{id}/qr
   */
  generateTableQR: async (id: number): Promise<TableQRResponse> => {
    const response = await axiosClient.post<TableQRResponse>(`/tables/${id}/qr`);
    return response.data;
  },

  /**
   * Update table status (Admin/Waiter only)
   * PUT /tables/{id}/status?status={status}
   */
  updateTableStatus: async (id: number, status: TableStatus): Promise<TableResponse> => {
    const response = await axiosClient.put<TableResponse>(
      `/tables/${id}/status`,
      null,
      { params: { status } }
    );
    return response.data;
  },

  /**
   * Get available table count (Admin only)
   * GET /tables/stats/available-count
   */
  getAvailableTableCount: async (): Promise<number> => {
    const response = await axiosClient.get<number>('/tables/stats/available-count');
    return response.data;
  },

  /**
   * Free table (mark as available) (Admin/Waiter only)
   * PUT /tables/{id}/free
   */
  freeTable: async (id: number): Promise<TableResponse> => {
    const response = await axiosClient.put<TableResponse>(`/tables/${id}/free`);
    return response.data;
  },

  /**
   * Sync table status with orders (Admin only)
   * POST /tables/sync-status
   */
  syncTableStatus: async (): Promise<void> => {
    await axiosClient.post('/tables/sync-status');
  },
};
