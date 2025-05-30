/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Module, UserModuleAccess } from '@/types/module';

/**
 * API Response Types
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: ApiError | null;
  meta?: {
    timestamp?: string;
    requestId?: string;
    pagination?: {
      page: number;
      pageSize: number;
      totalPages: number;
      totalItems: number;
    };
  };
}

/**
 * API Error Interface
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  status: number;
}

/**
 * Module API Error
 */
export class ModuleApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, any>;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', status: number = 500, details?: Record<string, any>) {
    super(message);
    this.name = 'ModuleApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * User-friendly error messages for common errors
 */
const errorMessages: Record<string, string> = {
  'NETWORK_ERROR': 'Network error. Please check your internet connection.',
  'TIMEOUT': 'Request timed out. Please try again.',
  'SERVER_ERROR': 'Server error. Please try again later.',
  'UNAUTHORIZED': 'You are not authorized to perform this action.',
  'NOT_FOUND': 'The requested resource was not found.',
  'VALIDATION_ERROR': 'Invalid input data. Please check your inputs.',
  'RATE_LIMIT_EXCEEDED': 'Too many requests. Please try again later.',
  'MODULE_NOT_FOUND': 'The specified module does not exist.',
  'USER_NOT_FOUND': 'The specified user does not exist.',
  'ACCESS_DENIED': 'Access denied. You do not have permission to perform this action.',
};

/**
 * Get user-friendly error message
 */
const getUserFriendlyErrorMessage = (error: any): string => {
  if (error instanceof ModuleApiError) {
    return errorMessages[error.code] || error.message;
  }
  
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<any>>;
    
    // Check for network errors
    if (!axiosError.response) {
      return errorMessages.NETWORK_ERROR;
    }
    
    // Get error from response if available
    const apiError = axiosError.response?.data?.error;
    if (apiError) {
      return errorMessages[apiError.code] || apiError.message;
    }
    
    // Handle HTTP status codes
    switch (axiosError.response.status) {
      case 401:
        return errorMessages.UNAUTHORIZED;
      case 403:
        return errorMessages.ACCESS_DENIED;
      case 404:
        return errorMessages.NOT_FOUND;
      case 422:
        return errorMessages.VALIDATION_ERROR;
      case 429:
        return errorMessages.RATE_LIMIT_EXCEEDED;
      case 500:
      case 502:
      case 503:
      case 504:
        return errorMessages.SERVER_ERROR;
      default:
        return axiosError.message;
    }
  }
  
  return error?.message || 'An unknown error occurred.';
};

/**
 * Create an axios instance with custom configurations
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: '/api',
    timeout: 10000, // 10 seconds timeout
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Request interceptor for adding auth token
  client.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Response interceptor for handling errors
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // Implement retry logic for specific errors
      if (axios.isAxiosError(error) && error.response) {
        // Retry on 503 (Service Unavailable) or 504 (Gateway Timeout)
        if ((error.response.status === 503 || error.response.status === 504) 
            && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // Wait for 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return client(originalRequest);
        }
        
        // Handle token expiration by refreshing token
        if (error.response.status === 401 && !originalRequest._retry) {
          // Implement token refresh logic here if needed
          // For now, just reject with a user-friendly message
          return Promise.reject(
            new ModuleApiError(
              'Your session has expired. Please log in again.',
              'SESSION_EXPIRED',
              401
            )
          );
        }
        
        // Convert API errors to user-friendly format
        if (error.response.data?.error) {
          const apiError = error.response.data.error;
          return Promise.reject(
            new ModuleApiError(
              apiError.message,
              apiError.code,
              apiError.status,
              apiError.details
            )
          );
        }
      }
      
      // Timeout errors
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(
          new ModuleApiError(
            'Request timed out. Please try again.',
            'TIMEOUT',
            408
          )
        );
      }
      
      // Network errors
      if (!error.response) {
        return Promise.reject(
          new ModuleApiError(
            'Network error. Please check your internet connection.',
            'NETWORK_ERROR',
            0
          )
        );
      }
      
      return Promise.reject(error);
    }
  );
  
  return client;
};

// Create an API client instance
const apiClient = createApiClient();

/**
 * Get all available modules
 */
export async function getAllModules(): Promise<Module[]> {
  try {
    const response = await apiClient.get<ApiResponse<Module[]>>('/admin/modules');
    return response.data.data;
  } catch (error) {
    const errorMessage = getUserFriendlyErrorMessage(error);
    throw new ModuleApiError(
      errorMessage,
      error instanceof ModuleApiError ? error.code : 'FETCH_MODULES_ERROR',
      error instanceof ModuleApiError ? error.status : 500
    );
  }
}

/**
 * Get modules for a specific role
 */
export async function getModulesForRole(role: string): Promise<Module[]> {
  try {
    const response = await apiClient.get<ApiResponse<Module[]>>(`/admin/modules?role=${encodeURIComponent(role)}`);
    return response.data.data;
  } catch (error) {
    const errorMessage = getUserFriendlyErrorMessage(error);
    throw new ModuleApiError(
      errorMessage,
      error instanceof ModuleApiError ? error.code : 'FETCH_ROLE_MODULES_ERROR',
      error instanceof ModuleApiError ? error.status : 500
    );
  }
}

/**
 * Get module access for a user
 */
export async function getUserModuleAccess(userId: string): Promise<Record<string, boolean>> {
  try {
    const response = await apiClient.get<ApiResponse<Record<string, boolean>>>(`/admin/modules/access?userId=${encodeURIComponent(userId)}`);
    return response.data.data;
  } catch (error) {
    const errorMessage = getUserFriendlyErrorMessage(error);
    throw new ModuleApiError(
      errorMessage,
      error instanceof ModuleApiError ? error.code : 'FETCH_USER_ACCESS_ERROR',
      error instanceof ModuleApiError ? error.status : 500
    );
  }
}

/**
 * Update module access for a user
 */
export async function updateModuleAccess(
  userId: string,
  moduleId: string,
  hasAccess: boolean
): Promise<Record<string, boolean>> {
  try {
    const response = await apiClient.post<ApiResponse<Record<string, boolean>>>('/admin/modules/access', {
      userId,
      moduleId,
      hasAccess
    });
    return response.data.data;
  } catch (error) {
    const errorMessage = getUserFriendlyErrorMessage(error);
    throw new ModuleApiError(
      errorMessage,
      error instanceof ModuleApiError ? error.code : 'UPDATE_MODULE_ACCESS_ERROR',
      error instanceof ModuleApiError ? error.status : 500
    );
  }
}

