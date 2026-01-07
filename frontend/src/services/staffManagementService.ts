// Staff Management Service for handling staff availability and status

export type StaffStatus = 'AVAILABLE' | 'UNAVAILABLE';

export interface StaffData {
  staffId: string;
  name: string;
  email: string;
  role: 'CHEF' | 'WAITER';
  status: StaffStatus;
  assignedOrdersCount?: number;
}

// Get all staff members
export function getAllStaff(): StaffData[] {
  const staffData = localStorage.getItem('staffData');
  return staffData ? JSON.parse(staffData) : [];
}

// Get staff member by ID
export function getStaffById(staffId: string): StaffData | null {
  const allStaff = getAllStaff();
  return allStaff.find(s => s.staffId === staffId) || null;
}

// Get available staff by role
export function getAvailableStaffByRole(role: 'CHEF' | 'WAITER'): StaffData[] {
  const allStaff = getAllStaff();
  return allStaff.filter(s => s.role === role && s.status === 'AVAILABLE');
}

// Initialize staff data from users
export function initializeStaffData(): void {
  const existingStaffData = localStorage.getItem('staffData');
  if (existingStaffData) {
    return; // Already initialized
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const staffMembers = users
    .filter((u: any) => u.role === 'CHEF' || u.role === 'WAITER')
    .map((u: any) => ({
      staffId: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: 'AVAILABLE' as StaffStatus,
      assignedOrdersCount: 0
    }));

  localStorage.setItem('staffData', JSON.stringify(staffMembers));
}

// Sync staff data with users (when new staff is added)
export function syncStaffDataWithUsers(): void {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const existingStaffData = getAllStaff();
  
  const staffMembers = users
    .filter((u: any) => u.role === 'CHEF' || u.role === 'WAITER')
    .map((u: any) => {
      // Check if staff already exists
      const existing = existingStaffData.find(s => s.staffId === u.id);
      if (existing) {
        return existing;
      }
      // New staff member
      return {
        staffId: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: 'AVAILABLE' as StaffStatus,
        assignedOrdersCount: 0
      };
    });

  localStorage.setItem('staffData', JSON.stringify(staffMembers));
}

// Update staff status
export function updateStaffStatus(staffId: string, status: StaffStatus): StaffData | null {
  const allStaff = getAllStaff();
  const index = allStaff.findIndex(s => s.staffId === staffId);
  
  if (index === -1) return null;
  
  allStaff[index].status = status;
  localStorage.setItem('staffData', JSON.stringify(allStaff));
  
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('staffStatusUpdated', { 
    detail: { staffId, status } 
  }));
  
  return allStaff[index];
}

// Update staff assigned orders count
export function updateStaffOrdersCount(staffId: string, count: number): void {
  const allStaff = getAllStaff();
  const index = allStaff.findIndex(s => s.staffId === staffId);
  
  if (index !== -1) {
    allStaff[index].assignedOrdersCount = count;
    localStorage.setItem('staffData', JSON.stringify(allStaff));
  }
}

// Recalculate assigned orders count for all staff
export function recalculateStaffOrdersCounts(): void {
  const allStaff = getAllStaff();
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  
  allStaff.forEach(staff => {
    const assignedOrders = orders.filter((o: any) => 
      o.assignedStaff === staff.staffId && 
      (o.status === 'PREPARING' || o.status === 'PENDING')
    );
    staff.assignedOrdersCount = assignedOrders.length;
  });
  
  localStorage.setItem('staffData', JSON.stringify(allStaff));
}
