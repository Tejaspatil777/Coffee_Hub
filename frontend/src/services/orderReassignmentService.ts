// Order Reassignment Service for handling staff unavailability and order reassignment

import { createCustomerNotification } from './customerNotificationService';
import { getAllStaff, updateStaffStatus, recalculateStaffOrdersCounts } from './staffManagementService';

export interface OrderWithStaff {
  id: string;
  customerId: string;
  customerName?: string;
  items: any[];
  booking: any;
  status: string;
  assignedStaff?: string;
  assignedStaffName?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

// Get all orders
export function getAllOrders(): OrderWithStaff[] {
  const orders = localStorage.getItem('orders');
  return orders ? JSON.parse(orders) : [];
}

// Save all orders
function saveOrders(orders: OrderWithStaff[]): void {
  localStorage.setItem('orders', JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent('ordersUpdated'));
}

// Assign order to staff
export function assignOrderToStaff(orderId: string, staffId: string): OrderWithStaff | null {
  const orders = getAllOrders();
  const staff = getAllStaff();
  const index = orders.findIndex(o => o.id === orderId);
  
  if (index === -1) return null;
  
  const order = orders[index];
  const staffMember = staff.find(s => s.staffId === staffId);
  
  if (!staffMember) return null;
  
  // Update order
  order.assignedStaff = staffId;
  order.assignedStaffName = staffMember.name;
  order.status = 'PREPARING';
  order.updatedAt = new Date().toISOString();
  
  orders[index] = order;
  saveOrders(orders);
  
  // Recalculate staff orders count
  recalculateStaffOrdersCounts();
  
  // Send notification to customer
  if (order.customerId) {
    createCustomerNotification({
      customerId: order.customerId,
      type: 'INFO',
      title: '🍳 Your order is being prepared!',
      message: `Your order has been assigned to ${staffMember.name} and is now being prepared.`,
      data: {
        orderId: order.id,
        status: 'PREPARING',
        staffName: staffMember.name
      }
    });
  }
  
  return order;
}

// Handle staff becoming unavailable - return their orders to queue
export function handleStaffUnavailable(staffId: string): { 
  affectedOrders: OrderWithStaff[], 
  staffName: string 
} {
  const orders = getAllOrders();
  const staff = getAllStaff();
  const staffMember = staff.find(s => s.staffId === staffId);
  
  if (!staffMember) {
    return { affectedOrders: [], staffName: '' };
  }
  
  // Find all PREPARING orders assigned to this staff
  const affectedOrders: OrderWithStaff[] = [];
  
  orders.forEach((order, index) => {
    if (order.assignedStaff === staffId && order.status === 'PREPARING') {
      // Move order back to queue
      order.status = 'PENDING';
      order.assignedStaff = undefined;
      order.assignedStaffName = undefined;
      order.updatedAt = new Date().toISOString();
      orders[index] = order;
      affectedOrders.push(order);
      
      // Send notification to customer
      if (order.customerId) {
        createCustomerNotification({
          customerId: order.customerId,
          type: 'INFO',
          title: '⏳ Minor delay on your order',
          message: `A staff member became unavailable. Your order is back in queue and will be assigned to another staff member shortly.`,
          data: {
            orderId: order.id,
            status: 'PENDING',
            reason: 'staff_unavailable'
          }
        });
      }
    }
  });
  
  saveOrders(orders);
  
  // Recalculate staff orders count
  recalculateStaffOrdersCounts();
  
  return {
    affectedOrders,
    staffName: staffMember.name
  };
}

// Get pending (queued) orders
export function getPendingOrders(): OrderWithStaff[] {
  const orders = getAllOrders();
  return orders.filter(o => o.status === 'PENDING');
}

// Get orders by staff
export function getOrdersByStaff(staffId: string): OrderWithStaff[] {
  const orders = getAllOrders();
  return orders.filter(o => o.assignedStaff === staffId);
}

// Get orders in preparation
export function getPreparingOrders(): OrderWithStaff[] {
  const orders = getAllOrders();
  return orders.filter(o => o.status === 'PREPARING');
}

// Reassign order to new staff (for manual reassignment)
export function reassignOrder(orderId: string, newStaffId: string): OrderWithStaff | null {
  const orders = getAllOrders();
  const staff = getAllStaff();
  const index = orders.findIndex(o => o.id === orderId);
  
  if (index === -1) return null;
  
  const order = orders[index];
  const newStaff = staff.find(s => s.staffId === newStaffId);
  
  if (!newStaff) return null;
  
  const previousStaff = order.assignedStaffName;
  
  // Update order
  order.assignedStaff = newStaffId;
  order.assignedStaffName = newStaff.name;
  order.status = 'PREPARING';
  order.updatedAt = new Date().toISOString();
  
  orders[index] = order;
  saveOrders(orders);
  
  // Recalculate staff orders count
  recalculateStaffOrdersCounts();
  
  // Send notification to customer
  if (order.customerId) {
    const message = previousStaff 
      ? `Order reassigned from ${previousStaff} to ${newStaff.name}. Your order is being prepared.`
      : `Your order has been assigned to ${newStaff.name} and is now being prepared.`;
      
    createCustomerNotification({
      customerId: order.customerId,
      type: 'INFO',
      title: '🍳 Order resumed with new staff',
      message: message,
      data: {
        orderId: order.id,
        status: 'PREPARING',
        staffName: newStaff.name,
        previousStaff: previousStaff
      }
    });
  }
  
  return order;
}
