// Customer Session Service - Track logged-in customers and their real-time status

export type CustomerStatus = 
  | 'BROWSING'           // Just logged in, viewing site
  | 'REQUESTED_TABLE'    // Submitted booking request
  | 'WAITING_APPROVAL'   // Booking pending admin approval
  | 'BOOKING_CONFIRMED'  // Admin approved, can order
  | 'ORDERING'           // Adding items to cart
  | 'ORDER_PLACED'       // Order submitted to kitchen
  | 'BEING_SERVED'       // Order ready/being served
  | 'COMPLETED';         // Session complete

export interface CustomerSession {
  userId: string;
  userName: string;
  userEmail: string;
  loginTime: string;
  lastActivity: string;
  status: CustomerStatus;
  currentBookingId?: string;
  currentOrderId?: string;
  tableNumber?: string;
  locationId?: string;
  locationName?: string;
}

// Get all active customer sessions
export function getActiveCustomerSessions(): CustomerSession[] {
  const sessions = localStorage.getItem('customerSessions');
  return sessions ? JSON.parse(sessions) : [];
}

// Get session by user ID
export function getCustomerSession(userId: string): CustomerSession | null {
  const sessions = getActiveCustomerSessions();
  return sessions.find(s => s.userId === userId) || null;
}

// Create or update customer session
export function createOrUpdateSession(
  userId: string,
  userName: string,
  userEmail: string,
  status?: CustomerStatus
): CustomerSession {
  const sessions = getActiveCustomerSessions();
  const existingIndex = sessions.findIndex(s => s.userId === userId);
  
  const now = new Date().toISOString();
  
  if (existingIndex !== -1) {
    // Update existing session
    sessions[existingIndex] = {
      ...sessions[existingIndex],
      lastActivity: now,
      status: status || sessions[existingIndex].status,
    };
    
    localStorage.setItem('customerSessions', JSON.stringify(sessions));
    window.dispatchEvent(new CustomEvent('customerSessionUpdated', { 
      detail: sessions[existingIndex] 
    }));
    
    return sessions[existingIndex];
  } else {
    // Create new session
    const newSession: CustomerSession = {
      userId,
      userName,
      userEmail,
      loginTime: now,
      lastActivity: now,
      status: status || 'BROWSING',
    };
    
    sessions.push(newSession);
    localStorage.setItem('customerSessions', JSON.stringify(sessions));
    
    window.dispatchEvent(new CustomEvent('customerSessionCreated', { 
      detail: newSession 
    }));
    
    return newSession;
  }
}

// Update customer status
export function updateCustomerStatus(
  userId: string,
  status: CustomerStatus,
  bookingId?: string,
  orderId?: string,
  tableNumber?: string,
  locationId?: string,
  locationName?: string
): CustomerSession | null {
  const sessions = getActiveCustomerSessions();
  const index = sessions.findIndex(s => s.userId === userId);
  
  if (index === -1) return null;
  
  sessions[index] = {
    ...sessions[index],
    status,
    lastActivity: new Date().toISOString(),
    ...(bookingId && { currentBookingId: bookingId }),
    ...(orderId && { currentOrderId: orderId }),
    ...(tableNumber && { tableNumber }),
    ...(locationId && { locationId }),
    ...(locationName && { locationName }),
  };
  
  localStorage.setItem('customerSessions', JSON.stringify(sessions));
  
  window.dispatchEvent(new CustomEvent('customerSessionUpdated', { 
    detail: sessions[index] 
  }));
  
  return sessions[index];
}

// Remove customer session (logout)
export function removeCustomerSession(userId: string) {
  const sessions = getActiveCustomerSessions();
  const filtered = sessions.filter(s => s.userId !== userId);
  
  localStorage.setItem('customerSessions', JSON.stringify(filtered));
  
  window.dispatchEvent(new CustomEvent('customerSessionRemoved', { 
    detail: { userId } 
  }));
}

// Update last activity timestamp
export function updateLastActivity(userId: string) {
  const sessions = getActiveCustomerSessions();
  const index = sessions.findIndex(s => s.userId === userId);
  
  if (index !== -1) {
    sessions[index].lastActivity = new Date().toISOString();
    localStorage.setItem('customerSessions', JSON.stringify(sessions));
  }
}

// Get status display label
export function getStatusLabel(status: CustomerStatus): string {
  switch (status) {
    case 'BROWSING':
      return 'Browsing Menu';
    case 'REQUESTED_TABLE':
      return 'Requested Table';
    case 'WAITING_APPROVAL':
      return 'Waiting for Approval';
    case 'BOOKING_CONFIRMED':
      return 'Booking Confirmed';
    case 'ORDERING':
      return 'Placing Order';
    case 'ORDER_PLACED':
      return 'Order Placed';
    case 'BEING_SERVED':
      return 'Being Served';
    case 'COMPLETED':
      return 'Completed';
    default:
      return status;
  }
}

// Get status color for badge
export function getStatusColor(status: CustomerStatus): string {
  switch (status) {
    case 'BROWSING':
      return 'bg-blue-500';
    case 'REQUESTED_TABLE':
    case 'WAITING_APPROVAL':
      return 'bg-yellow-500';
    case 'BOOKING_CONFIRMED':
      return 'bg-green-500';
    case 'ORDERING':
      return 'bg-purple-500';
    case 'ORDER_PLACED':
      return 'bg-orange-500';
    case 'BEING_SERVED':
      return 'bg-cyan-500';
    case 'COMPLETED':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
}

// Clean up old sessions (older than 24 hours)
export function cleanupOldSessions() {
  const sessions = getActiveCustomerSessions();
  const now = new Date().getTime();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  
  const active = sessions.filter(s => {
    const lastActivity = new Date(s.lastActivity).getTime();
    return (now - lastActivity) < twentyFourHours;
  });
  
  localStorage.setItem('customerSessions', JSON.stringify(active));
}
