// Customer Notification Service for managing customer-facing notifications

export type CustomerNotificationType = 
  | 'BOOKING_APPROVED' 
  | 'BOOKING_REJECTED' 
  | 'BOOKING_CANCELLED'
  | 'TABLE_READY'
  | 'ORDER_ACCEPTED'
  | 'ORDER_PREPARING'
  | 'ORDER_READY' 
  | 'ORDER_DELAYED' 
  | 'ORDER_REASSIGNED'
  | 'ORDER_CANCELLED'
  | 'WAITER_ASSIGNED'
  | 'FOOD_SERVED'
  | 'INFO';

export interface CustomerNotification {
  id: string;
  customerId: string;
  type: CustomerNotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: {
    bookingId?: string;
    orderId?: string;
    tableNumber?: string;
    [key: string]: any;
  };
}

// Get all notifications for a customer
export function getCustomerNotifications(customerId: string): CustomerNotification[] {
  const notifications = localStorage.getItem('customerNotifications');
  const allNotifications: CustomerNotification[] = notifications ? JSON.parse(notifications) : [];
  return allNotifications.filter(n => n.customerId === customerId);
}

// Get unread notifications count for a customer
export function getUnreadNotificationsCount(customerId: string): number {
  const notifications = getCustomerNotifications(customerId);
  return notifications.filter(n => !n.isRead).length;
}

// Create a new customer notification
export function createCustomerNotification(data: Omit<CustomerNotification, 'id' | 'isRead' | 'createdAt'>): CustomerNotification {
  const notifications = localStorage.getItem('customerNotifications');
  const allNotifications: CustomerNotification[] = notifications ? JSON.parse(notifications) : [];
  
  const newNotification: CustomerNotification = {
    ...data,
    id: 'CUST_NOTIF_' + Date.now() + Math.random().toString(36).substr(2, 9),
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  
  allNotifications.unshift(newNotification); // Add to beginning
  localStorage.setItem('customerNotifications', JSON.stringify(allNotifications));
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('customerNotificationCreated', { detail: newNotification }));
  
  return newNotification;
}

// Mark notification as read
export function markCustomerNotificationAsRead(notificationId: string): void {
  const notifications = localStorage.getItem('customerNotifications');
  const allNotifications: CustomerNotification[] = notifications ? JSON.parse(notifications) : [];
  
  const index = allNotifications.findIndex(n => n.id === notificationId);
  if (index !== -1) {
    allNotifications[index].isRead = true;
    localStorage.setItem('customerNotifications', JSON.stringify(allNotifications));
    
    // Trigger event for UI updates
    window.dispatchEvent(new CustomEvent('customerNotificationRead'));
  }
}

// Mark all notifications as read for a customer
export function markAllCustomerNotificationsAsRead(customerId: string): void {
  const notifications = localStorage.getItem('customerNotifications');
  const allNotifications: CustomerNotification[] = notifications ? JSON.parse(notifications) : [];
  
  allNotifications.forEach(n => {
    if (n.customerId === customerId) {
      n.isRead = true;
    }
  });
  
  localStorage.setItem('customerNotifications', JSON.stringify(allNotifications));
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('customerNotificationRead'));
}

// Clear all notifications for a customer
export function clearCustomerNotifications(customerId: string): void {
  const notifications = localStorage.getItem('customerNotifications');
  const allNotifications: CustomerNotification[] = notifications ? JSON.parse(notifications) : [];
  
  const filteredNotifications = allNotifications.filter(n => n.customerId !== customerId);
  localStorage.setItem('customerNotifications', JSON.stringify(filteredNotifications));
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('customerNotificationRead'));
}