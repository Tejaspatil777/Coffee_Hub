import axiosClient from './axiosClient';
import { CartItemRequest, CartResponse } from './types';

/**
 * Cart API
 * Handles shopping cart operations
 * All endpoints return data directly (ApiResponse wrapper handled by axios interceptor)
 */
export const cartApi = {
  /**
   * Get cart
   * GET /cart
   * Can identify cart by userId, sessionToken, or tableId
   */
  getCart: async (
    userId?: number,
    sessionToken?: string,
    tableId?: number
  ): Promise<CartResponse> => {
    const response = await axiosClient.get<CartResponse>('/cart', {
      params: {
        userId,
        sessionToken,
        tableId,
      },
    });
    return response.data;
  },

  /**
   * Add item to cart
   * POST /cart/items
   */
  addItem: async (
    item: CartItemRequest,
    userId?: number,
    sessionToken?: string,
    tableId?: number
  ): Promise<CartResponse> => {
    const response = await axiosClient.post<CartResponse>('/cart/items', item, {
      params: {
        userId,
        sessionToken,
        tableId,
      },
    });
    return response.data;
  },

  /**
   * Update cart item
   * PUT /cart/items/{itemId}
   */
  updateItem: async (
    itemId: number,
    item: CartItemRequest,
    userId?: number,
    sessionToken?: string,
    tableId?: number
  ): Promise<CartResponse> => {
    const response = await axiosClient.put<CartResponse>(`/cart/items/${itemId}`, item, {
      params: {
        userId,
        sessionToken,
        tableId,
      },
    });
    return response.data;
  },

  /**
   * Remove item from cart
   * DELETE /cart/items/{itemId}
   */
  removeItem: async (
    itemId: number,
    userId?: number,
    sessionToken?: string,
    tableId?: number
  ): Promise<CartResponse> => {
    const response = await axiosClient.delete<CartResponse>(`/cart/items/${itemId}`, {
      params: {
        userId,
        sessionToken,
        tableId,
      },
    });
    return response.data;
  },

  /**
   * Clear cart
   * DELETE /cart
   */
  clearCart: async (
    userId?: number,
    sessionToken?: string,
    tableId?: number
  ): Promise<CartResponse> => {
    const response = await axiosClient.delete<CartResponse>('/cart', {
      params: {
        userId,
        sessionToken,
        tableId,
      },
    });
    return response.data;
  },

  /**
   * Merge guest cart with user cart after login
   * POST /cart/merge
   */
  mergeCarts: async (sessionToken: string, userId: number): Promise<void> => {
    await axiosClient.post('/cart/merge', null, {
      params: {
        sessionToken,
        userId,
      },
    });
  },
};
