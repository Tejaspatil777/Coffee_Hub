import axiosClient from './axiosClient';
import { AcceptInvitationRequest, InviteStaffRequest } from './types';

/**
 * Pending Invitation Info
 */
export interface PendingInvitation {
  id: number;
  name: string;
  email: string;
  role: string;
  invitationSentAt: string;
  expiresAt: string;
  isExpired: boolean;
}

/**
 * Invitation Stats
 */
export interface InvitationStats {
  total: number;
  accepted: number;
  pending: number;
  expired: number;
}

/**
 * Invitation Validation Response
 */
export interface InvitationValidationResponse {
  name: string;
  email: string;
  role: string;
  sentAt: string;
  expiresAt: string;
}

/**
 * Staff Invitation API
 * Handles staff invitation workflow using /api/invitations endpoints
 * Note: This is different from /auth/validate-invitation used for initial validation
 */
export const invitationApi = {
  /**
   * Send staff invitation (Admin only)
   * POST /api/invitations/send
   */
  sendInvitation: async (request: InviteStaffRequest): Promise<{ success: boolean; message: string; userId: number; email: string }> => {
    // Remove /api prefix as it's already in base URL
    const response = await axiosClient.post<{ success: boolean; message: string; userId: number; email: string }>(
      '/invitations/send',
      request
    );
    return response.data;
  },

  /**
   * Validate invitation token
   * GET /api/invitations/validate/{token}
   */
  validateToken: async (token: string): Promise<InvitationValidationResponse> => {
    const response = await axiosClient.get<InvitationValidationResponse>(
      `/invitations/validate/${token}`
    );
    return response.data;
  },

  /**
   * Accept invitation and set password
   * POST /api/invitations/accept
   */
  acceptInvitation: async (request: AcceptInvitationRequest): Promise<{ success: boolean; message: string; email: string; role: string }> => {
    const response = await axiosClient.post<{ success: boolean; message: string; email: string; role: string }>(
      '/invitations/accept',
      request
    );
    return response.data;
  },

  /**
   * Get pending invitations (Admin only)
   * GET /api/invitations/pending
   */
  getPendingInvitations: async (): Promise<PendingInvitation[]> => {
    const response = await axiosClient.get<PendingInvitation[]>('/invitations/pending');
    return response.data;
  },

  /**
   * Resend invitation (Admin only)
   * POST /api/invitations/{userId}/resend
   */
  resendInvitation: async (userId: number): Promise<{ success: boolean; message: string }> => {
    const response = await axiosClient.post<{ success: boolean; message: string }>(
      `/invitations/${userId}/resend`
    );
    return response.data;
  },

  /**
   * Cancel invitation (Admin only)
   * DELETE /api/invitations/{userId}/cancel
   */
  cancelInvitation: async (userId: number): Promise<{ success: boolean; message: string }> => {
    const response = await axiosClient.delete<{ success: boolean; message: string }>(
      `/invitations/${userId}/cancel`
    );
    return response.data;
  },

  /**
   * Get invitation statistics (Admin only)
   * GET /api/invitations/stats
   */
  getInvitationStats: async (): Promise<InvitationStats> => {
    const response = await axiosClient.get<InvitationStats>('/invitations/stats');
    return response.data;
  },
};
