/**
 * Real-time Sync Service for TakeBits
 * Handles localStorage synchronization across all admin views
 */

// Event types for real-time updates
export const REALTIME_EVENTS = {
  BOOKING_UPDATED: 'bookingUpdated',
  ORDER_UPDATED: 'orderUpdated',
  MENU_UPDATED: 'menuUpdated',
  TABLE_UPDATED: 'tableUpdated',
  STAFF_UPDATED: 'staffUpdated',
  CUSTOMER_UPDATED: 'customerUpdated',
  PAYMENT_UPDATED: 'paymentUpdated',
  REQUIREMENT_UPDATED: 'requirementUpdated',
  NOTIFICATION_CREATED: 'notificationCreated',
  CART_UPDATED: 'cartUpdated',
  FEEDBACK_UPDATED: 'feedbackUpdated',
  TABLE_HISTORY_UPDATED: 'tableHistoryUpdated',
  CUSTOMER_SESSION_UPDATED: 'customerSessionUpdated',
} as const;

/**
 * Trigger a real-time update event
 */
export function triggerRealtimeUpdate(eventType: string, data?: any) {
  const event = new CustomEvent(eventType, { detail: data });
  window.dispatchEvent(event);
}

/**
 * Subscribe to real-time updates
 */
export function subscribeToRealtimeUpdates(
  eventTypes: string[],
  callback: (eventType: string, data?: any) => void
): () => void {
  const handlers: { [key: string]: (e: Event) => void } = {};

  eventTypes.forEach(eventType => {
    const handler = (e: Event) => {
      callback(eventType, (e as CustomEvent).detail);
    };
    handlers[eventType] = handler;
    window.addEventListener(eventType, handler);
  });

  // Return cleanup function
  return () => {
    Object.entries(handlers).forEach(([eventType, handler]) => {
      window.removeEventListener(eventType, handler);
    });
  };
}

/**
 * Update localStorage and trigger real-time event
 */
export function updateLocalStorageWithSync(
  key: string,
  data: any,
  eventType: string
) {
  localStorage.setItem(key, JSON.stringify(data));
  triggerRealtimeUpdate(eventType, { key, data });
}

/**
 * Get data from localStorage with type safety
 */
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key: ${key}`, error);
    return defaultValue;
  }
}

/**
 * Real-time data refresh utility
 */
export class RealtimeDataManager {
  private listeners: Map<string, Set<() => void>> = new Map();

  /**
   * Register a refresh callback for a specific data type
   */
  register(dataType: string, callback: () => void) {
    if (!this.listeners.has(dataType)) {
      this.listeners.set(dataType, new Set());
    }
    this.listeners.get(dataType)!.add(callback);

    // Return cleanup function
    return () => {
      this.listeners.get(dataType)?.delete(callback);
    };
  }

  /**
   * Trigger refresh for all listeners of a data type
   */
  refresh(dataType: string) {
    this.listeners.get(dataType)?.forEach(callback => callback());
  }

  /**
   * Refresh all registered listeners
   */
  refreshAll() {
    this.listeners.forEach(callbacks => {
      callbacks.forEach(callback => callback());
    });
  }
}

export const realtimeManager = new RealtimeDataManager();

/**
 * Auto-refresh hook for components
 */
export function setupAutoRefresh(intervalMs: number = 5000): () => void {
  const interval = setInterval(() => {
    realtimeManager.refreshAll();
  }, intervalMs);

  return () => clearInterval(interval);
}

/**
 * Cleanup old data utility
 */
export function cleanupOldData() {
  const orders = getFromLocalStorage<any[]>('orders', []);
  const bookings = getFromLocalStorage<any[]>('bookings', []);
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  // Archive old completed orders
  const activeOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt).getTime();
    return orderDate > thirtyDaysAgo || 
           !['DELIVERED', 'CANCELLED'].includes(order.status);
  });

  // Archive old served/cancelled bookings
  const activeBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.createdAt).getTime();
    return bookingDate > thirtyDaysAgo || 
           !['SERVED', 'CANCELLED'].includes(booking.status);
  });

  localStorage.setItem('orders', JSON.stringify(activeOrders));
  localStorage.setItem('bookings', JSON.stringify(activeBookings));
  
  triggerRealtimeUpdate(REALTIME_EVENTS.ORDER_UPDATED);
  triggerRealtimeUpdate(REALTIME_EVENTS.BOOKING_UPDATED);
}

/**
 * Clear completed/cancelled orders
 */
export function clearCompletedOrders() {
  const orders = getFromLocalStorage<any[]>('orders', []);
  const activeOrders = orders.filter(order => 
    !['DELIVERED', 'CANCELLED'].includes(order.status)
  );
  
  updateLocalStorageWithSync('orders', activeOrders, REALTIME_EVENTS.ORDER_UPDATED);
  return orders.length - activeOrders.length;
}

/**
 * Clear cancelled bookings
 */
export function clearCancelledBookings() {
  const bookings = getFromLocalStorage<any[]>('bookings', []);
  const activeBookings = bookings.filter(booking => 
    booking.status !== 'CANCELLED'
  );
  
  updateLocalStorageWithSync('bookings', activeBookings, REALTIME_EVENTS.BOOKING_UPDATED);
  return bookings.length - activeBookings.length;
}

/**
 * Get real-time statistics
 */
export function getRealtimeStats() {
  const orders = getFromLocalStorage<any[]>('orders', []);
  const bookings = getFromLocalStorage<any[]>('bookings', []);
  const users = getFromLocalStorage<any[]>('users', []);
  const menuItems = getFromLocalStorage<any[]>('menuItems', []);
  const requirements = getFromLocalStorage<any[]>('customerRequirements', []);

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => 
    new Date(o.createdAt).toDateString() === today
  );

  return {
    totalCustomers: users.filter(u => u.role === 'CUSTOMER').length,
    activeStaff: users.filter(u => 
      (u.role === 'CHEF' || u.role === 'WAITER') && u.status === 'ACTIVE'
    ).length,
    todayOrders: todayOrders.length,
    pendingOrders: orders.filter(o => o.status === 'PENDING').length,
    activeBookings: bookings.filter(b => 
      ['CONFIRMED', 'SEATED'].includes(b.status)
    ).length,
    totalRevenue: orders
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + (o.total || 0), 0),
    availableMenuItems: menuItems.filter(i => i.available).length,
    totalMenuItems: menuItems.length,
    pendingRequirements: requirements.filter(r => r.status === 'PENDING').length,
    completionRate: orders.length > 0
      ? (orders.filter(o => o.status === 'DELIVERED').length / orders.length) * 100
      : 0,
  };
}

/**
 * Calculate most selling items
 */
export function getMostSellingItems(limit: number = 5) {
  const orders = getFromLocalStorage<any[]>('orders', []);
  const itemCounts: { [key: string]: { count: number; name: string; revenue: number } } = {};

  orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        if (!itemCounts[item.id]) {
          itemCounts[item.id] = { count: 0, name: item.name, revenue: 0 };
        }
        itemCounts[item.id].count += item.quantity || 1;
        itemCounts[item.id].revenue += (item.price || 0) * (item.quantity || 1);
      });
    }
  });

  return Object.entries(itemCounts)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
