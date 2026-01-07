import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiResponse } from './types';

// Base URL for your Java Spring Boot backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Create axios instance
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to every request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle ApiResponse wrapper and errors
axiosClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    // Extract data from ApiResponse wrapper
    // Backend returns: { success: boolean, message: string, data: T, timestamp: string, error: string }
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      // Return the actual data from the wrapper
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error: AxiosError<ApiResponse<any>>) => {
    if (error.response) {
      // Extract error message from ApiResponse wrapper
      const errorMessage = error.response.data?.error || error.response.data?.message || 'An error occurred';
      
      // Handle specific HTTP errors
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Access forbidden:', errorMessage);
          break;
        case 404:
          console.error('Resource not found:', errorMessage);
          break;
        case 500:
          console.error('Server error:', errorMessage);
          break;
        default:
          console.error('API Error:', errorMessage);
      }
      
      // Create a new error with the extracted message
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).response = error.response;
      (enhancedError as any).status = error.response.status;
      return Promise.reject(enhancedError);
    } else if (error.request) {
      const networkError = new Error('No response received from server. Please check your connection.');
      console.error('Network error:', networkError.message);
      return Promise.reject(networkError);
    } else {
      const requestError = new Error(error.message || 'Error setting up request');
      console.error('Request setup error:', requestError.message);
      return Promise.reject(requestError);
    }
  }
);

export default axiosClient;
