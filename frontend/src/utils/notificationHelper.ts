// Helper utility to show unread notifications to customers
// This ensures notifications are shown once per session/page load

import { getCustomerNotifications } from '../services/customerNotificationService';
import { toast } from 'sonner@2.0.3';

const SHOWN_NOTIFICATIONS_KEY = 'shownNotifications';

/**
 * Get the list of notification IDs that have been shown in this session
 */
function getShownNotifications(): Set<string> {
  try {
    const shown = sessionStorage.getItem(SHOWN_NOTIFICATIONS_KEY);
    return shown ? new Set(JSON.parse(shown)) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * Mark a notification as shown in this session
 */
function markNotificationAsShown(notificationId: string): void {
  const shown = getShownNotifications();
  shown.add(notificationId);
  sessionStorage.setItem(SHOWN_NOTIFICATIONS_KEY, JSON.stringify([...shown]));
}

/**
 * Show unread notifications for a customer as toast messages
 * Only shows notifications that haven't been shown in this session yet
 * 
 * @param customerId - The customer's user ID
 * @param maxToShow - Maximum number of notifications to show (default: 3)
 * @returns The number of notifications shown
 */
export function showUnreadNotifications(customerId: string, maxToShow: number = 3): number {
  const notifications = getCustomerNotifications(customerId);
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const shownNotifications = getShownNotifications();
  
  // Filter out notifications that have already been shown in this session
  const notificationsToShow = unreadNotifications
    .filter(n => !shownNotifications.has(n.id))
    .slice(0, maxToShow);
  
  // Show each notification as a toast
  notificationsToShow.forEach((notification, index) => {
    // Stagger the notifications slightly if showing multiple
    setTimeout(() => {
      // Choose toast type based on notification type
      let toastFn = toast.success;
      
      if (notification.type === 'BOOKING_REJECTED') {
        toastFn = toast.error;
      } else if (notification.type === 'ORDER_READY') {
        toastFn = toast.info;
      }
      
      toastFn(notification.title, {
        description: notification.message,
        duration: 5000,
      });
      
      // Mark as shown in session
      markNotificationAsShown(notification.id);
    }, index * 300); // 300ms delay between each notification
  });
  
  return notificationsToShow.length;
}

/**
 * Clear the session's shown notifications list
 * Useful for testing or when user logs out
 */
export function clearShownNotifications(): void {
  sessionStorage.removeItem(SHOWN_NOTIFICATIONS_KEY);
}
