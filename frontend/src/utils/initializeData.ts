// Initialize default data in localStorage if not present
// This runs only once when the app first loads

import { feedbackService } from '../services/feedbackService';

export function initializeDefaultData() {
  // Initialize tables if not exists
  const existingTables = localStorage.getItem('tables');
  
  if (!existingTables) {
    const defaultTables = [
      { id: 'T1', tableNumber: 'T1', capacity: 2, position: 'Window', status: 'FREE' },
      { id: 'T2', tableNumber: 'T2', capacity: 2, position: 'Corner', status: 'FREE' },
      { id: 'T3', tableNumber: 'T3', capacity: 2, position: 'Front Window', status: 'FREE' },
      { id: 'T4', tableNumber: 'T4', capacity: 2, position: 'Near Entrance', status: 'FREE' },
      { id: 'T5', tableNumber: 'T5', capacity: 4, position: 'Center', status: 'FREE' },
      { id: 'T6', tableNumber: 'T6', capacity: 4, position: 'Garden View', status: 'FREE' },
      { id: 'T7', tableNumber: 'T7', capacity: 4, position: 'Patio', status: 'FREE' },
      { id: 'T8', tableNumber: 'T8', capacity: 4, position: 'By Fireplace', status: 'FREE' },
      { id: 'T9', tableNumber: 'T9', capacity: 6, position: 'Private Area', status: 'FREE' },
      { id: 'T10', tableNumber: 'T10', capacity: 6, position: 'Main Hall', status: 'FREE' },
      { id: 'T11', tableNumber: 'T11', capacity: 6, position: 'Garden Corner', status: 'FREE' },
      { id: 'T12', tableNumber: 'T12', capacity: 8, position: 'VIP Room', status: 'FREE' },
      { id: 'T13', tableNumber: 'T13', capacity: 8, position: 'Conference Suite', status: 'FREE' },
      { id: 'T14', tableNumber: 'T14', capacity: 4, position: 'Terrace', status: 'FREE' },
      { id: 'T15', tableNumber: 'T15', capacity: 2, position: 'Balcony', status: 'FREE' }
    ];
    
    localStorage.setItem('tables', JSON.stringify(defaultTables));
    console.log('Default tables initialized');
  }

  // Initialize bookings if not exists (empty array)
  const existingBookings = localStorage.getItem('bookings');
  if (!existingBookings) {
    localStorage.setItem('bookings', JSON.stringify([]));
    console.log('Bookings initialized (empty)');
  }

  // Initialize notifications if not exists (empty array)
  const existingNotifications = localStorage.getItem('bookingNotifications');
  if (!existingNotifications) {
    localStorage.setItem('bookingNotifications', JSON.stringify([]));
    console.log('Notifications initialized (empty)');
  }

  // Initialize orders if not exists (empty array)
  const existingOrders = localStorage.getItem('orders');
  if (!existingOrders) {
    localStorage.setItem('orders', JSON.stringify([]));
    console.log('Orders initialized (empty)');
  }

  // Initialize cart if not exists (empty array)
  const existingCart = localStorage.getItem('cart');
  if (!existingCart) {
    localStorage.setItem('cart', JSON.stringify([]));
    console.log('Cart initialized (empty)');
  }

  // Initialize table history if not exists (empty array)
  const existingTableHistory = localStorage.getItem('tableHistory');
  if (!existingTableHistory) {
    localStorage.setItem('tableHistory', JSON.stringify([]));
    console.log('Table history initialized (empty)');
  }

  // Initialize feedback sample data
  feedbackService.initializeSampleData();
  console.log('Feedback system initialized');
}