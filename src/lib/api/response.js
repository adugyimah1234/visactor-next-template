/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { HttpStatus } from './types';
import { ApiException, normalizeError } from './errors';
/**
 * Create a successful API response
 * @param data The data to include in the response
 * @param meta Optional metadata like pagination info
 * @param status HTTP status code (defaults to 200 OK)
 */
export function successResponse(data, meta, status = HttpStatus.OK) {
    const response = {
        success: true,
        data,
        error: null,
        meta: meta !== null && meta !== void 0 ? meta : { timestamp: new Date().toISOString() },
    };
    return NextResponse.json(response, { status });
}
/**
 * Create an error API response
 * @param error The error to include in the response (string, Error, or ApiException)
 * @param status Optional HTTP status code override
 */
export function errorResponse(error, status) {
    const apiException = normalizeError(error);
    const statusCode = status !== null && status !== void 0 ? status : apiException.status;
    const response = {
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
export function customResponse(data, error, success, meta, status = HttpStatus.OK) {
    const response = {
        success,
        data,
        error,
        meta: meta !== null && meta !== void 0 ? meta : { timestamp: new Date().toISOString() },
    };
    return NextResponse.json(response, { status });
}
/**
 * Create a not found response
 * @param resource The resource that was not found
 */
export function notFoundResponse(resource) {
    return errorResponse(new ApiException(`${resource} not found`, 'RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND));
}
/**
 * Create a validation error response
 * @param message Error message
 * @param details Validation error details
 */
export function validationErrorResponse(message, details) {
    return errorResponse(new ApiException(message, 'VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, details));
}
/**
 * Handle API errors and convert them to standardized responses
 * @param fn The API handler function
 */
export function withErrorHandling(fn) {
    return fn().catch((error) => {
        console.error('API error:', error);
        return errorResponse(error);
    });
}
