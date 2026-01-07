// Booking Service for managing table bookings with admin approval

import { updateCustomerStatus as updateSessionStatus } from './customerSessionService';
import { createCustomerNotification } from './customerNotificationService';
import { createTableHistory } from './tableManagementService';
import { getPaymentsByBookingId, initiateRefund } from './paymentService';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'SERVED' | 'NO_SHOW';
export type NotificationType = 'NEW_BOOKING' | 'CANCELLATION' | 'STATUS_UPDATE' | 'INSTANT_BOOKING';

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  tableId: string;
  tableNumber: string;
  locationId: string;
  locationName: string;
  date: string;
  timeSlot: string;
  duration?: number; // Duration in minutes
  expectedEndTime?: string; // Calculated or user-provided end time
  guests: number;
  specialRequests?: string;
  bookingReason?: string;
  status: BookingStatus;
  adminNote?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  servedAt?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
}

export interface BookingNotification {
  id: string;
  type: NotificationType;
  bookingId: string;
  booking: Booking;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Get all bookings
export function getAllBookings(): Booking[] {
  const bookings = localStorage.getItem('bookings');
  return bookings ? JSON.parse(bookings) : [];
}

// Get booking by ID
export function getBookingById(id: string): Booking | null {
  const bookings = getAllBookings();
  return bookings.find(b => b.id === id) || null;
}

// Get bookings by customer ID
export function getBookingsByCustomer(customerId: string): Booking[] {
  const bookings = getAllBookings();
  return bookings.filter(b => b.customerId === customerId);
}

// Get bookings by status
export function getBookingsByStatus(status: BookingStatus): Booking[] {
  const bookings = getAllBookings();
  return bookings.filter(b => b.status === status);
}

// Create new booking with instant approval if table is free
export function createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Booking {
  const bookings = getAllBookings();
  
  // Check if table is actually FREE for instant booking
  const tables = JSON.parse(localStorage.getItem('tables') || '[]');
  const table = tables.find((t: any) => t.id === bookingData.tableId);
  const isInstantBooking = table && table.status === 'FREE';
  
  const newBooking: Booking = {
    ...bookingData,
    id: 'BK' + Date.now() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Auto-confirm if table is FREE
    status: isInstantBooking ? 'CONFIRMED' : bookingData.status,
    confirmedAt: isInstantBooking ? new Date().toISOString() : undefined,
    // Add default duration and expected end time if not provided
    duration: bookingData.duration || 90, // Default 90 minutes
    expectedEndTime: bookingData.expectedEndTime || (() => {
      const duration = bookingData.duration || 90;
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + duration * 60000);
      return endTime.toISOString();
    })(),
  };
  
  bookings.push(newBooking);
  localStorage.setItem('bookings', JSON.stringify(bookings));
  
  if (isInstantBooking) {
    // Instant booking - no admin approval needed
    createNotification({
      type: 'INSTANT_BOOKING',
      bookingId: newBooking.id,
      booking: newBooking,
      message: `Instant booking confirmed for ${newBooking.customerName} - Table ${newBooking.tableNumber}`,
    });
    
    // Update customer session status to BOOKING_CONFIRMED
    updateSessionStatus(
      newBooking.customerId, 
      'BOOKING_CONFIRMED', 
      newBooking.id,
      undefined,
      newBooking.tableNumber,
      newBooking.locationId,
      newBooking.locationName
    );
    
    // Create customer notification for instant booking
    createCustomerNotification({
      customerId: newBooking.customerId,
      type: 'BOOKING_APPROVED',
      title: '✅ Table Reserved Instantly!',
      message: `Your table ${newBooking.tableNumber} is confirmed and ready! You can now order food.`,
      data: {
        bookingId: newBooking.id,
        tableNumber: newBooking.tableNumber,
        date: newBooking.date,
        timeSlot: newBooking.timeSlot,
      }
    });
    
    // Update table status to BOOKED
    updateTableStatus(newBooking.tableId, 'CONFIRMED');
  } else {
    // Regular booking - needs admin approval
    createNotification({
      type: 'NEW_BOOKING',
      bookingId: newBooking.id,
      booking: newBooking,
      message: `New booking request from ${newBooking.customerName} for ${newBooking.guests} guests`,
    });
  }
  
  return newBooking;
}

// Update booking status
export function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  adminNote?: string,
  rejectionReason?: string
): Booking | null {
  const bookings = getAllBookings();
  const index = bookings.findIndex(b => b.id === bookingId);
  
  if (index === -1) return null;
  
  const booking = bookings[index];
  const oldStatus = booking.status;
  
  booking.status = status;
  booking.updatedAt = new Date().toISOString();
  
  if (adminNote) booking.adminNote = adminNote;
  if (rejectionReason) booking.rejectionReason = rejectionReason;
  
  if (status === 'CONFIRMED') {
    booking.confirmedAt = new Date().toISOString();
    // Update customer session status
    updateSessionStatus(
      booking.customerId, 
      'BOOKING_CONFIRMED', 
      bookingId,
      undefined,
      booking.tableNumber,
      booking.locationId,
      booking.locationName
    );
    
    // Create customer notification for booking approval
    createCustomerNotification({
      customerId: booking.customerId,
      type: 'BOOKING_APPROVED',
      title: '🎉 Your table is reserved!',
      message: `Your booking for table ${booking.tableNumber} has been approved. You can now order food.`,
      data: {
        bookingId: booking.id,
        tableNumber: booking.tableNumber,
        date: booking.date,
        timeSlot: booking.timeSlot,
      }
    });
  } else if (status === 'CANCELLED') {
    booking.cancelledAt = new Date().toISOString();
    // Reset customer session status
    updateSessionStatus(
      booking.customerId, 
      'BROWSING'
    );
    
    // Create table history entry for cancellation
    createTableHistory({
      tableId: booking.tableId,
      tableNumber: booking.tableNumber,
      customerId: booking.customerId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      bookingId: booking.id,
      locationId: booking.locationId,
      locationName: booking.locationName,
      guests: booking.guests,
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: 'CANCELLED',
    });
    
    // Create customer notification for booking rejection (if not cancelled by customer)
    if (rejectionReason && oldStatus === 'PENDING') {
      createCustomerNotification({
        customerId: booking.customerId,
        type: 'BOOKING_REJECTED',
        title: 'Booking Request Update',
        message: `Unfortunately, your booking request has been declined. Reason: ${rejectionReason}`,
        data: {
          bookingId: booking.id,
          rejectionReason: rejectionReason,
        }
      });
    }
  } else if (status === 'SERVED') {
    booking.servedAt = new Date().toISOString();
    // Update customer session status
    updateSessionStatus(
      booking.customerId, 
      'COMPLETED'
    );
  } else if (status === 'NO_SHOW') {
    // Create table history entry for no-show
    createTableHistory({
      tableId: booking.tableId,
      tableNumber: booking.tableNumber,
      customerId: booking.customerId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      bookingId: booking.id,
      locationId: booking.locationId,
      locationName: booking.locationName,
      guests: booking.guests,
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: 'NO_SHOW',
    });
  }
  
  bookings[index] = booking;
  localStorage.setItem('bookings', JSON.stringify(bookings));
  
  // Update table status
  updateTableStatus(booking.tableId, status);
  
  // Create notification
  if (oldStatus !== status) {
    createNotification({
      type: 'STATUS_UPDATE',
      bookingId: booking.id,
      booking: booking,
      message: `Booking ${bookingId} status changed from ${oldStatus} to ${status}`,
    });
  }
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('bookingUpdated', { detail: booking }));
  
  return booking;
}

// Cancel booking
export function cancelBooking(bookingId: string, cancellationReason?: string): Booking | null {
  const bookings = getAllBookings();
  const index = bookings.findIndex(b => b.id === bookingId);
  
  if (index === -1) return null;
  
  const booking = bookings[index];
  booking.status = 'CANCELLED';
  booking.rejectionReason = cancellationReason || 'Cancelled by customer';
  booking.cancelledAt = new Date().toISOString();
  booking.updatedAt = new Date().toISOString();
  
  bookings[index] = booking;
  localStorage.setItem('bookings', JSON.stringify(bookings));
  
  // Cancel all orders associated with this booking
  cancelOrdersByBooking(bookingId);
  
  // Initiate refund for all payments associated with this booking
  const payments = getPaymentsByBookingId(bookingId);
  payments.forEach(payment => {
    if (payment.paymentStatus === 'PAID') {
      initiateRefund(payment.id, cancellationReason || 'Booking cancelled');
    }
  });
  
  // Free up the table
  updateTableStatus(booking.tableId, 'CANCELLED');
  
  // Create table history entry for cancellation
  createTableHistory({
    tableId: booking.tableId,
    tableNumber: booking.tableNumber,
    customerId: booking.customerId,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    bookingId: booking.id,
    locationId: booking.locationId,
    locationName: booking.locationName,
    guests: booking.guests,
    date: booking.date,
    timeSlot: booking.timeSlot,
    status: 'CANCELLED',
  });
  
  // Create customer notification for booking cancellation
  createCustomerNotification({
    customerId: booking.customerId,
    type: 'BOOKING_CANCELLED',
    title: 'Booking Cancelled',
    message: `Your booking for table ${booking.tableNumber} has been cancelled.${cancellationReason ? ' Reason: ' + cancellationReason : ''}`,
    data: {
      bookingId: booking.id,
      tableNumber: booking.tableNumber,
    }
  });
  
  // Create cancellation notification for admin
  createNotification({
    type: 'CANCELLATION',
    bookingId: booking.id,
    booking: booking,
    message: `Booking cancelled by ${booking.customerName}${cancellationReason ? ': ' + cancellationReason : ''}`,
  });
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('bookingUpdated', { detail: booking }));
  
  return booking;
}

// Cancel all orders associated with a booking
function cancelOrdersByBooking(bookingId: string): number {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  let cancelledCount = 0;
  
  const updatedOrders = orders.map((order: any) => {
    if (order.bookingId === bookingId && order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && order.status !== 'SERVED') {
      cancelledCount++;
      
      // Get order customer for notification
      const customerId = order.userId || order.customerId;
      if (customerId) {
        createCustomerNotification({
          customerId: customerId,
          type: 'ORDER_CANCELLED',
          title: 'Order Cancelled',
          message: `Your order has been cancelled because the booking was cancelled.`,
          data: {
            orderId: order.id,
            bookingId: bookingId,
          }
        });
      }
      
      return { ...order, status: 'CANCELLED', updatedAt: new Date().toISOString() };
    }
    return order;
  });
  
  localStorage.setItem('orders', JSON.stringify(updatedOrders));
  
  // Trigger event for UI updates
  if (cancelledCount > 0) {
    window.dispatchEvent(new CustomEvent('ordersUpdated'));
  }
  
  return cancelledCount;
}

// Get orders by booking ID
export function getOrdersByBooking(bookingId: string): any[] {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  return orders.filter((order: any) => order.bookingId === bookingId);
}

// Update table status based on booking status
function updateTableStatus(tableId: string, bookingStatus: BookingStatus) {
  const tables = JSON.parse(localStorage.getItem('tables') || '[]');
  const tableIndex = tables.findIndex((t: any) => t.id === tableId);
  
  if (tableIndex === -1) return;
  
  const table = tables[tableIndex];
  
  switch (bookingStatus) {
    case 'PENDING':
      table.status = 'BOOKED';
      break;
    case 'CONFIRMED':
      table.status = 'BOOKED';
      break;
    case 'SERVED':
      table.status = 'FREE';
      table.currentBooking = undefined;
      table.nextAvailableTime = undefined;
      break;
    case 'CANCELLED':
    case 'NO_SHOW':
      table.status = 'FREE';
      table.currentBooking = undefined;
      table.nextAvailableTime = undefined;
      break;
  }
  
  tables[tableIndex] = table;
  localStorage.setItem('tables', JSON.stringify(tables));
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('tableUpdated', { detail: table }));
}

// Notification Management
export function getAllNotifications(): BookingNotification[] {
  const notifications = localStorage.getItem('bookingNotifications');
  return notifications ? JSON.parse(notifications) : [];
}

export function getUnreadNotificationsCount(): number {
  const notifications = getAllNotifications();
  return notifications.filter(n => !n.isRead).length;
}

export function createNotification(data: Omit<BookingNotification, 'id' | 'isRead' | 'createdAt'>) {
  const notifications = getAllNotifications();
  
  const newNotification: BookingNotification = {
    ...data,
    id: 'NOTIF' + Date.now() + Math.random().toString(36).substr(2, 9),
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  
  notifications.unshift(newNotification); // Add to beginning
  localStorage.setItem('bookingNotifications', JSON.stringify(notifications));
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('notificationCreated', { detail: newNotification }));
}

export function markNotificationAsRead(notificationId: string) {
  const notifications = getAllNotifications();
  const index = notifications.findIndex(n => n.id === notificationId);
  
  if (index !== -1) {
    notifications[index].isRead = true;
    localStorage.setItem('bookingNotifications', JSON.stringify(notifications));
    
    // Trigger event for UI updates
    window.dispatchEvent(new CustomEvent('notificationRead'));
  }
}

export function markAllNotificationsAsRead() {
  const notifications = getAllNotifications();
  notifications.forEach(n => n.isRead = true);
  localStorage.setItem('bookingNotifications', JSON.stringify(notifications));
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('notificationRead'));
}

export function clearNotifications() {
  localStorage.setItem('bookingNotifications', JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('notificationRead'));
}