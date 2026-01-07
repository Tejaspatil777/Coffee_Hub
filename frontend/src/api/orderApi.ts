import axiosClient from './axiosClient';
import {
  OrderRequest,
  OrderResponse,
  OrderStatus,
  OrderType,
  PaymentStatus,
  PageResponse,
} from './types';

/**
 * Order API
 * Handles order creation, tracking, and management
 * All endpoints return data directly (ApiResponse wrapper handled by axios interceptor)
 */
export const orderApi = {
  /**
   * Create new order
   * POST /orders?userId={userId}
   */
  createOrder: async (orderRequest: OrderRequest, userId: number): Promise<OrderResponse> => {
    const response = await axiosClient.post<OrderResponse>(
      '/orders',
      orderRequest,
      { params: { userId } }
    );
    return response.data;
  },

  /**
   * Get order by ID
   * GET /orders/{orderId}
   */
  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    const response = await axiosClient.get<OrderResponse>(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Get user's orders
   * GET /orders/user/{userId}
   */
  getUserOrders: async (userId: number): Promise<OrderResponse[]> => {
    const response = await axiosClient.get<OrderResponse[]>(`/orders/user/${userId}`);
    return response.data;
  },

  /**
   * Get my orders (for currently logged-in user)
   * Uses user ID from localStorage
   */
  getMyOrders: async (): Promise<OrderResponse[]> => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('User not authenticated');
    }
    const user = JSON.parse(userStr);
    return orderApi.getUserOrders(user.id);
  },

  /**
   * Get orders with filters (paginated)
   * GET /orders
   * Staff/Admin only
   */
  getOrdersWithFilters: async (
    status?: OrderStatus,
    paymentStatus?: PaymentStatus,
    orderType?: OrderType,
    startDate?: string,
    endDate?: string,
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<OrderResponse>> => {
    const response = await axiosClient.get<PageResponse<OrderResponse>>('/orders', {
      params: {
        status,
        paymentStatus,
        orderType,
        startDate,
        endDate,
        page,
        size,
      },
    });
    return response.data;
  },

  /**
   * Get active kitchen orders
   * GET /orders/kitchen/active
   * Chef only
   */
  getActiveKitchenOrders: async (): Promise<OrderResponse[]> => {
    const response = await axiosClient.get<OrderResponse[]>('/orders/kitchen/active');
    return response.data;
  },

  /**
   * Get active delivery orders
   * GET /orders/delivery/active
   * Waiter only
   */
  getActiveDeliveryOrders: async (): Promise<OrderResponse[]> => {
    const response = await axiosClient.get<OrderResponse[]>('/orders/delivery/active');
    return response.data;
  },

  /**
   * Get pending orders (for staff dashboard)
   */
  getPendingOrders: async (): Promise<OrderResponse[]> => {
    const response = await orderApi.getOrdersWithFilters(OrderStatus.PENDING);
    return response.content;
  },

  /**
   * Get orders by status
   */
  getOrdersByStatus: async (status: OrderStatus): Promise<OrderResponse[]> => {
    const response = await orderApi.getOrdersWithFilters(status);
    return response.content;
  },

  /**
   * Update order status
   * PUT /orders/{orderId}/status
   */
  updateOrderStatus: async (
    orderId: string,
    status: OrderStatus,
    changedBy: number,
    notes?: string
  ): Promise<OrderResponse> => {
    const response = await axiosClient.put<OrderResponse>(
      `/orders/${orderId}/status`,
      null,
      {
        params: {
          status,
          changedBy,
          notes,
        },
      }
    );
    return response.data;
  },

  /**
   * Assign order to chef
   * PUT /orders/{orderId}/assign/chef
   * Chef/Admin only
   */
  assignOrderToChef: async (orderId: string, chefId: number): Promise<OrderResponse> => {
    const response = await axiosClient.put<OrderResponse>(
      `/orders/${orderId}/assign/chef`,
      null,
      { params: { chefId } }
    );
    return response.data;
  },

  /**
   * Assign order to waiter
   * PUT /orders/{orderId}/assign/waiter
   * Waiter/Admin only
   */
  assignOrderToWaiter: async (orderId: string, waiterId: number): Promise<OrderResponse> => {
    const response = await axiosClient.put<OrderResponse>(
      `/orders/${orderId}/assign/waiter`,
      null,
      { params: { waiterId } }
    );
    return response.data;
  },

  /**
   * Update payment status
   * PUT /orders/{orderId}/payment-status
   * Admin only
   */
  updatePaymentStatus: async (
    orderId: string,
    paymentStatus: PaymentStatus,
    stripePaymentIntentId?: string
  ): Promise<OrderResponse> => {
    const response = await axiosClient.put<OrderResponse>(
      `/orders/${orderId}/payment-status`,
      null,
      {
        params: {
          paymentStatus,
          stripePaymentIntentId,
        },
      }
    );
    return response.data;
  },

  /**
   * Cancel order
   * DELETE /orders/{orderId}
   */
  cancelOrder: async (orderId: string, userId: number, reason?: string): Promise<void> => {
    await axiosClient.delete(`/orders/${orderId}`, {
      params: {
        userId,
        reason,
      },
    });
  },
};
