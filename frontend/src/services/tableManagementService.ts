// Table Management Service with priority-based assignment and history tracking

import { Booking } from './bookingService';

export interface TableHistory {
  id: string;
  tableId: string;
  tableNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  bookingId: string;
  locationId: string;
  locationName: string;
  guests: number;
  date: string;
  timeSlot: string;
  checkInTime?: string;
  checkOutTime?: string;
  duration?: number; // in minutes
  revenue?: number;
  status: 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  createdAt: string;
  updatedAt: string;
}

export interface TableAssignment {
  tableId: string;
  tableNumber: string;
  capacity: number;
  position: string;
  status: 'FREE' | 'BOOKED' | 'OCCUPIED';
  currentCustomer?: {
    id: string;
    name: string;
    email: string;
    bookingId: string;
    guests: number;
    checkInTime: string;
    timeSlot: string;
  };
  priority?: number; // Higher number = higher priority
  nextAvailableTime?: string;
}

export interface CustomerPriority {
  customerId: string;
  customerName: string;
  score: number;
  factors: {
    vipStatus: boolean;
    loyaltyPoints: number;
    bookingFrequency: number;
    partySize: number;
    specialRequests: boolean;
    waitTime: number; // in minutes
  };
}

// Get all table history
export function getTableHistory(): TableHistory[] {
  const history = localStorage.getItem('tableHistory');
  return history ? JSON.parse(history) : [];
}

// Get table history by table ID
export function getTableHistoryByTable(tableId: string): TableHistory[] {
  const history = getTableHistory();
  return history.filter(h => h.tableId === tableId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Get table history by customer ID
export function getTableHistoryByCustomer(customerId: string): TableHistory[] {
  const history = getTableHistory();
  return history.filter(h => h.customerId === customerId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Create table history entry
export function createTableHistory(data: Omit<TableHistory, 'id' | 'createdAt' | 'updatedAt'>): TableHistory {
  const history = getTableHistory();
  
  const newHistory: TableHistory = {
    ...data,
    id: 'TH' + Date.now() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  history.push(newHistory);
  localStorage.setItem('tableHistory', JSON.stringify(history));
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('tableHistoryUpdated', { detail: newHistory }));
  
  return newHistory;
}

// Update table history entry
export function updateTableHistory(
  historyId: string,
  updates: Partial<TableHistory>
): TableHistory | null {
  const history = getTableHistory();
  const index = history.findIndex(h => h.id === historyId);
  
  if (index === -1) return null;
  
  history[index] = {
    ...history[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem('tableHistory', JSON.stringify(history));
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('tableHistoryUpdated', { detail: history[index] }));
  
  return history[index];
}

// Get current table assignments with customer information
export function getCurrentTableAssignments(): TableAssignment[] {
  const tables = JSON.parse(localStorage.getItem('tables') || '[]');
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  
  return tables.map((table: any) => {
    const assignment: TableAssignment = {
      tableId: table.id,
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      position: table.position,
      status: table.status,
    };
    
    // Find active booking for this table
    const activeBooking = bookings.find((b: Booking) => 
      b.tableId === table.id && 
      (b.status === 'CONFIRMED' || b.status === 'PENDING')
    );
    
    if (activeBooking) {
      assignment.currentCustomer = {
        id: activeBooking.customerId,
        name: activeBooking.customerName,
        email: activeBooking.customerEmail,
        bookingId: activeBooking.id,
        guests: activeBooking.guests,
        checkInTime: activeBooking.confirmedAt || activeBooking.createdAt,
        timeSlot: activeBooking.timeSlot,
      };
    }
    
    return assignment;
  });
}

// Calculate customer priority score
export function calculateCustomerPriority(
  customerId: string,
  guests: number,
  specialRequests?: string
): CustomerPriority {
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  const customers = JSON.parse(localStorage.getItem('users') || '[]');
  const customer = customers.find((c: any) => c.id === customerId);
  
  // Calculate booking frequency
  const customerBookings = bookings.filter((b: Booking) => b.customerId === customerId);
  const completedBookings = customerBookings.filter((b: Booking) => b.status === 'SERVED');
  
  // Check VIP status (customers with 5+ completed bookings)
  const isVIP = completedBookings.length >= 5;
  
  // Calculate loyalty points (10 points per completed booking)
  const loyaltyPoints = completedBookings.length * 10;
  
  // Calculate wait time (if there's a pending booking)
  const pendingBooking = bookings.find((b: Booking) => 
    b.customerId === customerId && b.status === 'PENDING'
  );
  const waitTime = pendingBooking 
    ? Math.floor((Date.now() - new Date(pendingBooking.createdAt).getTime()) / 60000)
    : 0;
  
  // Calculate priority score
  let score = 0;
  score += isVIP ? 50 : 0;
  score += loyaltyPoints;
  score += customerBookings.length * 5; // booking frequency
  score += guests >= 6 ? 30 : guests >= 4 ? 15 : 0; // larger parties
  score += specialRequests ? 20 : 0;
  score += Math.min(waitTime * 2, 100); // wait time bonus (max 100)
  
  return {
    customerId,
    customerName: customer?.name || 'Unknown',
    score,
    factors: {
      vipStatus: isVIP,
      loyaltyPoints,
      bookingFrequency: customerBookings.length,
      partySize: guests,
      specialRequests: !!specialRequests,
      waitTime,
    },
  };
}

// Get priority queue for table assignments
export function getPriorityQueue(): CustomerPriority[] {
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  const pendingBookings = bookings.filter((b: Booking) => b.status === 'PENDING');
  
  const priorities = pendingBookings.map((booking: Booking) => 
    calculateCustomerPriority(
      booking.customerId,
      booking.guests,
      booking.specialRequests
    )
  );
  
  return priorities.sort((a, b) => b.score - a.score);
}

// Suggest best table for a booking based on priority and capacity
export function suggestTableForBooking(
  guests: number,
  customerId: string,
  specialRequests?: string
): { tableId: string; tableNumber: string; reason: string } | null {
  const tables = JSON.parse(localStorage.getItem('tables') || '[]');
  const freeTables = tables.filter((t: any) => t.status === 'FREE');
  
  if (freeTables.length === 0) return null;
  
  const priority = calculateCustomerPriority(customerId, guests, specialRequests);
  
  // VIP customers get best tables (window, private, VIP)
  if (priority.factors.vipStatus) {
    const vipTable = freeTables.find((t: any) => 
      t.capacity >= guests && 
      (t.position.toLowerCase().includes('vip') || 
       t.position.toLowerCase().includes('private') ||
       t.position.toLowerCase().includes('window'))
    );
    
    if (vipTable) {
      return {
        tableId: vipTable.id,
        tableNumber: vipTable.tableNumber,
        reason: 'VIP customer - Premium table assigned',
      };
    }
  }
  
  // Large parties get specific tables
  if (guests >= 6) {
    const largeTable = freeTables.find((t: any) => 
      t.capacity >= guests && t.capacity <= guests + 2
    );
    
    if (largeTable) {
      return {
        tableId: largeTable.id,
        tableNumber: largeTable.tableNumber,
        reason: 'Large party - Suitable table assigned',
      };
    }
  }
  
  // Find best fit (closest capacity match)
  const suitableTables = freeTables.filter((t: any) => t.capacity >= guests);
  if (suitableTables.length === 0) return null;
  
  suitableTables.sort((a: any, b: any) => a.capacity - b.capacity);
  
  return {
    tableId: suitableTables[0].id,
    tableNumber: suitableTables[0].tableNumber,
    reason: 'Best capacity match',
  };
}

// Check in customer (start table history tracking)
export function checkInCustomer(bookingId: string): TableHistory | null {
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  const booking = bookings.find((b: Booking) => b.id === bookingId);
  
  if (!booking) return null;
  
  // Check if already checked in
  const existingHistory = getTableHistory().find(h => 
    h.bookingId === bookingId && h.status === 'ONGOING'
  );
  
  if (existingHistory) return existingHistory;
  
  // Create history entry
  return createTableHistory({
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
    checkInTime: new Date().toISOString(),
    status: 'ONGOING',
  });
}

// Check out customer (complete table history)
export function checkOutCustomer(bookingId: string, revenue?: number): TableHistory | null {
  const history = getTableHistory();
  const historyEntry = history.find(h => 
    h.bookingId === bookingId && h.status === 'ONGOING'
  );
  
  if (!historyEntry) return null;
  
  const checkOutTime = new Date().toISOString();
  const duration = Math.floor(
    (new Date(checkOutTime).getTime() - new Date(historyEntry.checkInTime || historyEntry.createdAt).getTime()) / 60000
  );
  
  return updateTableHistory(historyEntry.id, {
    status: 'COMPLETED',
    checkOutTime,
    duration,
    revenue,
  });
}

// Get table utilization statistics
export function getTableUtilizationStats() {
  const history = getTableHistory();
  const tables = JSON.parse(localStorage.getItem('tables') || '[]');
  
  const stats = tables.map((table: any) => {
    const tableHistory = history.filter(h => h.tableId === table.id && h.status === 'COMPLETED');
    const totalRevenue = tableHistory.reduce((sum, h) => sum + (h.revenue || 0), 0);
    const totalDuration = tableHistory.reduce((sum, h) => sum + (h.duration || 0), 0);
    const avgDuration = tableHistory.length > 0 ? totalDuration / tableHistory.length : 0;
    
    return {
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      position: table.position,
      totalBookings: tableHistory.length,
      totalRevenue,
      avgDuration: Math.round(avgDuration),
      utilizationRate: tableHistory.length > 0 ? (totalDuration / (24 * 60 * 30)) * 100 : 0, // Assuming 30 days
    };
  });
  
  return stats.sort((a, b) => b.totalRevenue - a.totalRevenue);
}
