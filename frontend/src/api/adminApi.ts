import axiosClient from './axiosClient';
import {
  AdminDashboardSummary,
  ActiveCustomerResponse,
  UserResponse,
  UserRole,
  InviteStaffRequest,
  InvitationResponse,
  MenuItemImportRequest,
  MenuImportSummary,
} from './types';

/**
 * Admin API
 * Handles administrative functions including user management, dashboard, and staff invitations
 * All endpoints return data directly (ApiResponse wrapper handled by axios interceptor)
 * All endpoints require ADMIN role
 */
export const adminApi = {
  // ==================== DASHBOARD ====================

  /**
   * Get admin dashboard summary
   * GET /admin/dashboard/summary
   */
  getDashboardSummary: async (): Promise<AdminDashboardSummary> => {
    const response = await axiosClient.get<AdminDashboardSummary>('/admin/dashboard/summary');
    return response.data;
  },

  /**
   * Get active customers (customers with recent activity)
   * GET /admin/active-customers
   */
  getActiveCustomers: async (): Promise<ActiveCustomerResponse[]> => {
    const response = await axiosClient.get<ActiveCustomerResponse[]>('/admin/active-customers');
    return response.data;
  },

  // ==================== USER MANAGEMENT ====================

  /**
   * Get all users
   * GET /admin/users
   */
  getAllUsers: async (): Promise<UserResponse[]> => {
    const response = await axiosClient.get<UserResponse[]>('/admin/users');
    return response.data;
  },

  /**
   * Get users by role
   * GET /admin/users/role/{role}
   */
  getUsersByRole: async (role: UserRole): Promise<UserResponse[]> => {
    const response = await axiosClient.get<UserResponse[]>(`/admin/users/role/${role}`);
    return response.data;
  },

  /**
   * Get all staff users (CHEF, WAITER, ADMIN)
   * GET /admin/users/staff
   */
  getStaffUsers: async (): Promise<UserResponse[]> => {
    const response = await axiosClient.get<UserResponse[]>('/admin/users/staff');
    return response.data;
  },

  /**
   * Get all customers
   * GET /admin/customers
   */
  getCustomers: async (): Promise<UserResponse[]> => {
    const response = await axiosClient.get<UserResponse[]>('/admin/customers');
    return response.data;
  },

  /**
   * Get user by ID
   * GET /admin/users/{id}
   */
  getUserById: async (id: number): Promise<UserResponse> => {
    const response = await axiosClient.get<UserResponse>(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Change user role
   * PUT /admin/users/{id}/role?newRole={role}
   */
  changeUserRole: async (id: number, newRole: UserRole): Promise<UserResponse> => {
    const response = await axiosClient.put<UserResponse>(
      `/admin/users/${id}/role`,
      null,
      { params: { newRole } }
    );
    return response.data;
  },

  /**
   * Delete user
   * DELETE /admin/users/{id}
   */
  deleteUser: async (id: number): Promise<void> => {
    await axiosClient.delete(`/admin/users/${id}`);
  },

  /**
   * Get user count by role
   * GET /admin/stats/users/count?role={role}
   */
  getUserCountByRole: async (role: UserRole): Promise<number> => {
    const response = await axiosClient.get<number>('/admin/stats/users/count', {
      params: { role },
    });
    return response.data;
  },

  // ==================== STAFF INVITATION ====================

  /**
   * Invite staff member (CHEF, WAITER, ADMIN)
   * POST /admin/invite-staff
   */
  inviteStaff: async (request: InviteStaffRequest): Promise<InvitationResponse> => {
    const response = await axiosClient.post<InvitationResponse>('/admin/invite-staff', request);
    return response.data;
  },

  // ==================== MENU MANAGEMENT ====================

  /**
   * Import menu items (bulk import)
   * POST /admin/menu/import
   */
  importMenuItems: async (items: MenuItemImportRequest[]): Promise<MenuImportSummary> => {
    const response = await axiosClient.post<MenuImportSummary>('/admin/menu/import', items);
    return response.data;
  },
};
