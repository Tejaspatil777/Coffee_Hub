/**
 * API Utility Functions
 * Helper functions for working with the backend API
 */

import { authApi } from './authApi';
import { UserResponse, UserRole } from './types';

/**
 * Get current authenticated user from localStorage
 */
export const getCurrentUser = (): UserResponse | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as UserResponse;
  } catch {
    return null;
  }
};

/**
 * Get current user's ID
 */
export const getCurrentUserId = (): number | null => {
  const user = getCurrentUser();
  return user?.id || null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

/**
 * Check if user has a specific role
 */
export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};

/**
 * Check if user is admin
 */
export const isAdmin = (): boolean => {
  return hasRole(UserRole.ADMIN);
};

/**
 * Check if user is chef
 */
export const isChef = (): boolean => {
  return hasRole(UserRole.CHEF);
};

/**
 * Check if user is waiter
 */
export const isWaiter = (): boolean => {
  return hasRole(UserRole.WAITER);
};

/**
 * Check if user is customer
 */
export const isCustomer = (): boolean => {
  return hasRole(UserRole.CUSTOMER);
};

/**
 * Check if user is staff (CHEF, WAITER, or ADMIN)
 */
export const isStaff = (): boolean => {
  return isChef() || isWaiter() || isAdmin();
};

/**
 * Get authentication token
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Get refresh token
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

/**
 * Clear all authentication data
 */
export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

/**
 * Format currency (USD)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Format date/time
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Format date only
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Format time only
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Generate a unique session token for guest users
 */
export const generateSessionToken = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get or create session token for guest cart
 */
export const getOrCreateSessionToken = (): string => {
  let token = localStorage.getItem('guestSessionToken');
  if (!token) {
    token = generateSessionToken();
    localStorage.setItem('guestSessionToken', token);
  }
  return token;
};

/**
 * Clear guest session token (after login)
 */
export const clearSessionToken = (): void => {
  localStorage.removeItem('guestSessionToken');
};

/**
 * Handle API error and return user-friendly message
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.data?.message) return error.response.data.message;
  return 'An unexpected error occurred';
};

/**
 * Retry API call with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

/**
 * Check if token is expired (basic check without JWT decode)
 */
export const isTokenExpired = (): boolean => {
  const token = getToken();
  if (!token) return true;

  try {
    // Basic JWT structure: header.payload.signature
    const payload = token.split('.')[1];
    if (!payload) return true;

    const decodedPayload = JSON.parse(atob(payload));
    const exp = decodedPayload.exp;

    if (!exp) return false;

    // Check if token expires in next 5 minutes
    const expirationTime = exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes

    return currentTime >= expirationTime - bufferTime;
  } catch {
    return true;
  }
};

/**
 * Auto-refresh token if needed
 */
export const ensureValidToken = async (): Promise<void> => {
  if (isTokenExpired()) {
    await authApi.refreshToken();
  }
};

/**
 * Safe JSON parse
 */
export const safeJsonParse = <T>(jsonString: string | null, defaultValue: T): T => {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return defaultValue;
  }
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Calculate order total with tax
 */
export const calculateOrderTotal = (subtotal: number, taxRate: number = 0.08): {
  subtotal: number;
  tax: number;
  total: number;
} => {
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};
