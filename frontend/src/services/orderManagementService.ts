// Order Management Service for handling order lifecycle

import { createCustomerNotification } from './customerNotificationService';

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: any[];
  booking: any;
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryTime?: string;
  preparationTime?: number;
  tableNumber?: string;
  servedAt?: string;
  completedAt?: string;
}

// Get all orders
export function getAllOrders(): Order[] {
  const orders = localStorage.getItem('orders');
  return orders ? JSON.parse(orders) : [];
}

// Get order by ID
export function getOrderById(id: string): Order | null {
  const orders = getAllOrders();
  return orders.find(o => o.id === id) || null;
}

// Get orders by customer ID
export function getOrdersByCustomer(customerId: string): Order[] {
  const orders = getAllOrders();
  return orders.filter(o => o.customerId === customerId);
}

// Get orders by status
export function getOrdersByStatus(status: OrderStatus): Order[] {
  const orders = getAllOrders();
  return orders.filter(o => o.status === status);
}

// Create new order
export function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
  const orders = getAllOrders();
  
  const newOrder: Order = {
    ...orderData,
    id: 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('orderCreated', { detail: newOrder }));
  
  return newOrder;
}

// Update order status
export function updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
  const orders = getAllOrders();
  const index = orders.findIndex(o => o.id === orderId);
  
  if (index === -1) return null;
  
  const order = orders[index];
  const oldStatus = order.status;
  order.status = status;
  order.updatedAt = new Date().toISOString();
  
  if (status === 'SERVED') {
    order.servedAt = new Date().toISOString();
  } else if (status === 'COMPLETED') {
    order.completedAt = new Date().toISOString();
  }
  
  orders[index] = order;
  localStorage.setItem('orders', JSON.stringify(orders));
  
  // Create customer notifications for order status changes
  if (oldStatus !== status && order.customerId) {
    if (status === 'PREPARING') {
      createCustomerNotification({
        customerId: order.customerId,
        type: 'INFO',
        title: '👨‍🍳 Your order is being prepared!',
        message: `Your order #${orderId.slice(-6)} is now being prepared by our chef.`,
        data: {
          orderId: order.id,
          status: status,
        }
      });
    } else if (status === 'READY') {
      createCustomerNotification({
        customerId: order.customerId,
        type: 'ORDER_READY',
        title: '✅ Your order is ready!',
        message: `Your order #${orderId.slice(-6)} is ready and will be served soon.`,
        data: {
          orderId: order.id,
          status: status,
          tableNumber: order.tableNumber,
        }
      });
    } else if (status === 'SERVED') {
      createCustomerNotification({
        customerId: order.customerId,
        type: 'INFO',
        title: '🎉 Enjoy your meal!',
        message: `Your order #${orderId.slice(-6)} has been served. Bon appétit!`,
        data: {
          orderId: order.id,
          status: status,
        }
      });
    }
  }
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('orderUpdated', { detail: order }));
  
  return order;
}

// Get orders for a specific table
export function getOrdersByTable(tableNumber: string): Order[] {
  const orders = getAllOrders();
  return orders.filter(o => o.tableNumber === tableNumber && o.status !== 'COMPLETED');
}

// Get pending orders count
export function getPendingOrdersCount(): number {
  const orders = getAllOrders();
  return orders.filter(o => o.status === 'PENDING').length;
}

// Get active orders (not completed)
export function getActiveOrders(): Order[] {
  const orders = getAllOrders();
  return orders.filter(o => o.status !== 'COMPLETED');
}

// Update multiple orders at once (for batch operations)
export function updateOrders(updatedOrders: Order[]): void {
  localStorage.setItem('orders', JSON.stringify(updatedOrders));
  window.dispatchEvent(new CustomEvent('ordersUpdated'));
}

// Cancel an order
export function cancelOrder(orderId: string, cancellationReason?: string): Order | null {
  const orders = getAllOrders();
  const index = orders.findIndex(o => o.id === orderId);
  
  if (index === -1) return null;
  
  const order = orders[index];
  
  // Only allow cancellation for pending or preparing orders
  if (order.status === 'CANCELLED' || order.status === 'COMPLETED' || order.status === 'SERVED') {
    return null;
  }
  
  order.status = 'CANCELLED';
  order.updatedAt = new Date().toISOString();
  
  orders[index] = order;
  localStorage.setItem('orders', JSON.stringify(orders));
  
  // Create customer notification
  createCustomerNotification({
    customerId: order.customerId,
    type: 'ORDER_CANCELLED',
    title: '❌ Order Cancelled',
    message: `Your order #${orderId.slice(-6)} has been cancelled.${cancellationReason ? ' Reason: ' + cancellationReason : ''}`,
    data: {
      orderId: order.id,
      status: 'CANCELLED',
      reason: cancellationReason,
    }
  });
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('orderUpdated', { detail: order }));
  window.dispatchEvent(new CustomEvent('ordersUpdated'));
  
  return order;
}