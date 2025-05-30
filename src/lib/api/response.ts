import { NextResponse } from 'next/server';
import { ApiError, ApiMeta, ApiResponse, HttpStatus } from './types';
import { ApiException, normalizeError } from './errors';

/**
 * Create a successful API response
 * @param data The data to include in the response
 * @param meta Optional metadata like pagination info
 * @param status HTTP status code (defaults to 200 OK)
 */
export function successResponse<T>(
  data: T,
  meta?: ApiMeta,
  status: number = HttpStatus.OK
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    error: null,
    meta: meta ?? { timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response, { status });
}

/**
 * Create an error API response
 * @param error The error to include in the response (string, Error, or ApiException)
 * @param status Optional HTTP status code override
 */
export function errorResponse(
  error: unknown,
  status?: number
): NextResponse<ApiResponse<null>> {
  const apiException = normalizeError(error);
  const statusCode = status ?? apiException.status;

  const response: ApiResponse<null> = {
    success: false,
    data: null,
    error: apiException.toApiError(),
    meta: { timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Create a custom API response
 * Can be used for complex scenarios where successResponse and errorResponse aren't flexible enough
 */
export function customResponse<T>(
  data: T | null,
  error: ApiError | null,
  success: boolean,
  meta?: ApiMeta,
  status: number = HttpStatus.OK
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success,
    data,
    error,
    meta: meta ?? { timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response, { status });
}

/**
 * Create a not found response
 * @param resource The resource that was not found
 */
export function notFoundResponse(
  resource: string
): NextResponse<ApiResponse<null>> {
  return errorResponse(new ApiException(
    `${resource} not found`,
    'RESOURCE_NOT_FOUND',
    HttpStatus.NOT_FOUND
  ));
}

/**
 * Create a validation error response
 * @param message Error message
 * @param details Validation error details
 */
export function validationErrorResponse(
  message: string,
  details?: Record<string, any>
): NextResponse<ApiResponse<null>> {
  return errorResponse(new ApiException(
    message,
    'VALIDATION_ERROR',
    HttpStatus.UNPROCESSABLE_ENTITY,
    details
  ));
}

/**
 * Handle API errors and convert them to standardized responses
 * @param fn The API handler function
 */
export function withErrorHandling<T>(
  fn: () => Promise<NextResponse<ApiResponse<T>>>
): Promise<NextResponse<ApiResponse<T> | ApiResponse<null>>> {
  return fn().catch((error) => {
    console.error('API error:', error);
    return errorResponse(error);
  });
}

