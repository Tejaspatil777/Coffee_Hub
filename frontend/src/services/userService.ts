import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: 'CUSTOMER' | 'CHEF' | 'WAITER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phoneNumber?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CreateStaffRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: 'CHEF' | 'WAITER' | 'ADMIN';
}

class UserService {
  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await api.get('/users/profile');
    return response.data;
  }

  // Update user profile
  async updateProfile(userData: UpdateProfileRequest): Promise<User> {
    const response = await api.put('/users/profile', userData);
    // Update local storage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...user, ...response.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return response.data;
  }

  // Change password
  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    await api.put('/users/change-password', passwordData);
  }

  // Get all users (Admin only)
  async getAllUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  }

  // Get user by ID (Admin only)
  async getUserById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  // Create staff (Admin only)
  async createStaff(staffData: CreateStaffRequest): Promise<User> {
    const response = await api.post('/users/staff', staffData);
    return response.data;
  }

  // Update user status (Admin only)
  async updateUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<User> {
    const response = await api.patch(`/users/${id}/status`, { status });
    return response.data;
  }

  // Delete user (Admin only)
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  // Get staff by role (Admin only)
  async getStaffByRole(role: 'CHEF' | 'WAITER' | 'ADMIN'): Promise<User[]> {
    const response = await api.get(`/users/staff/${role}`);
    return response.data;
  }
}

export default new UserService();
