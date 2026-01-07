import axiosClient from './axiosClient';

export interface MenuRecommendation {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  matchScore: number; // How well it matches user preferences (0-100)
  reason: string; // Why this is recommended
}

export interface UserPreferences {
  favoriteCategories: string[];
  dietaryRestrictions: string[];
  priceRange: { min: number; max: number };
  spiceLevel: 'mild' | 'medium' | 'hot';
}

export const recommendationApi = {
  // Get personalized menu recommendations
  getRecommendations: async (limit: number = 6): Promise<MenuRecommendation[]> => {
    const response = await axiosClient.get('/menu/recommendations', {
      params: { limit }
    });
    return response.data;
  },

  // Get recommendations based on user order history
  getRecommendationsBasedOnHistory: async (): Promise<MenuRecommendation[]> => {
    const response = await axiosClient.get('/menu/recommendations/history');
    return response.data;
  },

  // Get trending items
  getTrendingItems: async (limit: number = 5): Promise<MenuRecommendation[]> => {
    const response = await axiosClient.get('/menu/trending', {
      params: { limit }
    });
    return response.data;
  },

  // Update user preferences
  updatePreferences: async (preferences: UserPreferences): Promise<void> => {
    await axiosClient.put('/users/preferences', preferences);
  },

  // Get user preferences
  getUserPreferences: async (): Promise<UserPreferences> => {
    const response = await axiosClient.get('/users/preferences');
    return response.data;
  },
};
