import axiosClient from './axiosClient';
import { CategoryResponse, MenuItemResponse, ModifierResponse, ModifierType } from './types';

/**
 * Menu API
 * Handles menu items, categories, and modifiers
 * All endpoints return data directly (ApiResponse wrapper handled by axios interceptor)
 */
export const menuApi = {
  // ==================== CATEGORIES ====================
  
  /**
   * Get all categories
   * GET /menu/categories
   */
  getAllCategories: async (): Promise<CategoryResponse[]> => {
    const response = await axiosClient.get<CategoryResponse[]>('/menu/categories');
    return response.data;
  },

  /**
   * Get category by ID
   * GET /menu/categories/{id}
   */
  getCategoryById: async (id: number): Promise<CategoryResponse> => {
    const response = await axiosClient.get<CategoryResponse>(`/menu/categories/${id}`);
    return response.data;
  },

  /**
   * Create new category (Admin only)
   * POST /menu/categories
   */
  createCategory: async (data: Partial<CategoryResponse>): Promise<CategoryResponse> => {
    const response = await axiosClient.post<CategoryResponse>('/menu/categories', data);
    return response.data;
  },

  /**
   * Update category (Admin only)
   * PUT /menu/categories/{id}
   */
  updateCategory: async (id: number, data: Partial<CategoryResponse>): Promise<CategoryResponse> => {
    const response = await axiosClient.put<CategoryResponse>(`/menu/categories/${id}`, data);
    return response.data;
  },

  /**
   * Delete category (Admin only)
   * DELETE /menu/categories/{id}
   */
  deleteCategory: async (id: number): Promise<void> => {
    await axiosClient.delete(`/menu/categories/${id}`);
  },

  // ==================== MENU ITEMS ====================
  
  /**
   * Get all menu items
   * GET /menu/items
   */
  getAllItems: async (): Promise<MenuItemResponse[]> => {
    const response = await axiosClient.get<MenuItemResponse[]>('/menu/items');
    return response.data;
  },

  /**
   * Get menu item by ID
   * GET /menu/items/{id}
   */
  getItemById: async (id: number): Promise<MenuItemResponse> => {
    const response = await axiosClient.get<MenuItemResponse>(`/menu/items/${id}`);
    return response.data;
  },

  /**
   * Get menu items by category
   * GET /menu/items/category/{categoryId}
   */
  getItemsByCategory: async (categoryId: number): Promise<MenuItemResponse[]> => {
    const response = await axiosClient.get<MenuItemResponse[]>(
      `/menu/items/category/${categoryId}`
    );
    return response.data;
  },

  /**
   * Search menu items
   * GET /menu/items/search
   * @param query - Search query (optional)
   * @param categoryId - Filter by category (optional)
   * @param minPrice - Minimum price filter (optional)
   * @param maxPrice - Maximum price filter (optional)
   */
  searchItems: async (
    query?: string,
    categoryId?: number,
    minPrice?: number,
    maxPrice?: number
  ): Promise<MenuItemResponse[]> => {
    const response = await axiosClient.get<MenuItemResponse[]>('/menu/items/search', {
      params: {
        query,
        categoryId,
        minPrice,
        maxPrice,
      },
    });
    return response.data;
  },

  /**
   * Create new menu item (Admin only)
   * POST /menu/items
   */
  createMenuItem: async (data: Partial<MenuItemResponse>): Promise<MenuItemResponse> => {
    const response = await axiosClient.post<MenuItemResponse>('/menu/items', data);
    return response.data;
  },

  /**
   * Update menu item (Admin only)
   * PUT /menu/items/{id}
   */
  updateMenuItem: async (id: number, data: Partial<MenuItemResponse>): Promise<MenuItemResponse> => {
    const response = await axiosClient.put<MenuItemResponse>(`/menu/items/${id}`, data);
    return response.data;
  },

  /**
   * Delete menu item (Admin only)
   * DELETE /menu/items/{id}
   */
  deleteMenuItem: async (id: number): Promise<void> => {
    await axiosClient.delete(`/menu/items/${id}`);
  },

  // ==================== MODIFIERS ====================
  
  /**
   * Get all modifiers
   * GET /menu/modifiers
   */
  getAllModifiers: async (): Promise<ModifierResponse[]> => {
    const response = await axiosClient.get<ModifierResponse[]>('/menu/modifiers');
    return response.data;
  },

  /**
   * Get modifiers by type
   * GET /menu/modifiers/type/{type}
   */
  getModifiersByType: async (type: ModifierType): Promise<ModifierResponse[]> => {
    const response = await axiosClient.get<ModifierResponse[]>(`/menu/modifiers/type/${type}`);
    return response.data;
  },

  /**
   * Create new modifier (Admin only)
   * POST /menu/modifiers
   */
  createModifier: async (data: Partial<ModifierResponse>): Promise<ModifierResponse> => {
    const response = await axiosClient.post<ModifierResponse>('/menu/modifiers', data);
    return response.data;
  },
};

