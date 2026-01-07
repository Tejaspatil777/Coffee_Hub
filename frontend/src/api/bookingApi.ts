import axiosClient from './axiosClient';

export interface BookingRequest {
  tableId: string;
  locationId: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
}

export interface Booking {
  id: string;
  tableId: string;
  locationId: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  status: string;
  createdAt: string;
}

export interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  position: string;
  locationId: string;
  isAvailable: boolean;
  currentBooking?: {
    startTime: string;
    endTime: string;
    customerName: string;
  };
}

export interface TableAvailability {
  tableId: string;
  tableNumber: string;
  capacity: number;
  position: string;
  status: 'FREE' | 'BOOKED' | 'OCCUPIED';
  nextAvailableTime?: string;
  currentBooking?: {
    startTime: string;
    endTime: string;
  };
}

export const bookingApi = {
  // Get all bookings for current user
  getMyBookings: async (): Promise<Booking[]> => {
    const response = await axiosClient.get('/bookings/my-bookings');
    return response.data;
  },

  // Create new booking
  createBooking: async (data: BookingRequest): Promise<Booking> => {
    const response = await axiosClient.post('/bookings', data);
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (id: string): Promise<Booking> => {
    const response = await axiosClient.get(`/bookings/${id}`);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (id: string): Promise<void> => {
    await axiosClient.delete(`/bookings/${id}`);
  },

  // Get available tables
  getAvailableTables: async (date: string, time: string): Promise<any[]> => {
    const response = await axiosClient.get('/tables/available', {
      params: { date, time }
    });
    return response.data;
  },

  // Get all tables
  getAllTables: async (): Promise<any[]> => {
    const response = await axiosClient.get('/tables');
    return response.data;
  },

  // Get real-time table availability status
  getTableAvailability: async (locationId: string, date: string, time: string): Promise<TableAvailability[]> => {
    const response = await axiosClient.get('/tables/availability', {
      params: { locationId, date, time }
    });
    return response.data;
  },

  // Get tables by location
  getTablesByLocation: async (locationId: string): Promise<Table[]> => {
    const response = await axiosClient.get(`/tables/location/${locationId}`);
    return response.data;
  },
};