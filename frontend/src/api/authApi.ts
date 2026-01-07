import axiosClient from './axiosClient';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  AcceptInvitationRequest,
  StaffInvitationInfo,
} from './types';

/**
 * Authentication API
 * Handles user authentication, registration, and token management
 * All endpoints return data directly (ApiResponse wrapper handled by axios interceptor)
 */
export const authApi = {
  /**
   * Login user
   * POST /auth/login
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', data);
    // Store tokens in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Register new user
   * POST /auth/register
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/register', data);
    // Store tokens in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   * POST /auth/refresh?refreshToken={token}
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await axiosClient.post<AuthResponse>(
      '/auth/refresh',
      null,
      { params: { refreshToken } }
    );
    
    // Update tokens in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Logout user
   * POST /auth/logout?refreshToken={token}
   */
  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await axiosClient.post('/auth/logout', null, { params: { refreshToken } });
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }
    
    // Clear local storage regardless of API call success
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  /**
   * Validate staff invitation token
   * GET /auth/validate-invitation?token={token}
   */
  validateInvitation: async (token: string): Promise<StaffInvitationInfo> => {
    const response = await axiosClient.get<StaffInvitationInfo>(
      '/auth/validate-invitation',
      { params: { token } }
    );
    return response.data;
  },

  /**
   * Accept staff invitation and complete registration
   * POST /auth/accept-invitation
   */
  acceptInvitation: async (data: AcceptInvitationRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/accept-invitation', data);
    // Store tokens in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Get current user from localStorage
   * (No API call needed - data already stored)
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};

