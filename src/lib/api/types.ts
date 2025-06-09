/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Standard API response interface
 * All API endpoints should return responses that follow this structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta?: ApiMeta;
}

/**
 * API error interface
 * Used to provide structured error information to clients
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  status: number;
}

/**
 * API metadata interface
 * Used for pagination, filtering, etc.
 */
export interface ApiMeta {
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
  timestamp?: string;
  requestId?: string;
}

/**
 * HTTP Status codes
 * Common HTTP status codes used in the API
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Error codes
 * Standardized error codes used across the API
 */
export enum ErrorCode {
  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Resource errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
}

