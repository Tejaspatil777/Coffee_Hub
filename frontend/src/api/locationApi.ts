import axiosClient from './axiosClient';

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  openingTime: string;
  closingTime: string;
  distance?: number; // Distance in km from user
  isOpen: boolean;
}

export const locationApi = {
  // Get all cafe/restaurant locations
  getAllLocations: async (): Promise<Location[]> => {
    const response = await axiosClient.get('/locations');
    return response.data;
  },

  // Get nearest locations based on user's current position
  getNearestLocations: async (latitude: number, longitude: number, limit: number = 5): Promise<Location[]> => {
    const response = await axiosClient.get('/locations/nearest', {
      params: { latitude, longitude, limit }
    });
    return response.data;
  },

  // Get location by ID
  getLocationById: async (id: string): Promise<Location> => {
    const response = await axiosClient.get(`/locations/${id}`);
    return response.data;
  },

  // Search locations by city or address
  searchLocations: async (query: string): Promise<Location[]> => {
    const response = await axiosClient.get('/locations/search', {
      params: { query }
    });
    return response.data;
  },
};
