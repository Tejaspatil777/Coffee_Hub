import api from './api';

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface CreateOrderRequest {
  bookingId: string;
  items: OrderItem[];
  specialRequests?: string;
}

export interface Order {
  id: string;
  userId: string;
  bookingId: string;
  items: OrderItem[];
  total: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  specialRequests?: string;
  estimatedDeliveryTime?: string;
  preparationTime?: number;
  createdAt: string;
  updatedAt: string;
  booking?: any;
}

class OrderService {
  // Create order
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const response = await api.post('/orders', orderData);
    return response.data;
  }

  // Get user orders
  async getUserOrders(): Promise<Order[]> {
    const response = await api.get('/orders/my-orders');
    return response.data;
  }

  // Get order by ID
  async getOrderById(id: string): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  }

  // Get all orders (Staff only)
  async getAllOrders(status?: string): Promise<Order[]> {
    const response = await api.get('/orders', {
      params: status ? { status } : {},
    });
    return response.data;
  }

  // Update order status (Staff only)
  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  }

  // Cancel order
  async cancelOrder(id: string): Promise<void> {
    await api.put(`/orders/${id}/cancel`);
  }

  // Get orders by table (Waiter)
  async getOrdersByTable(tableId: string): Promise<Order[]> {
    const response = await api.get(`/orders/table/${tableId}`);
    return response.data;
  }

  // Get pending orders (Chef)
  async getPendingOrders(): Promise<Order[]> {
    const response = await api.get('/orders/pending');
    return response.data;
  }

  // Get ready orders (Waiter)
  async getReadyOrders(): Promise<Order[]> {
    const response = await api.get('/orders/ready');
    return response.data;
  }
}

export default new OrderService();
