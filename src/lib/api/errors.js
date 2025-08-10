/* eslint-disable @typescript-eslint/no-explicit-any */
import { ErrorCode, HttpStatus } from './types';
/**
 * Base API error class
 * All custom API errors should extend this class
 */
export class ApiException extends Error {
    constructor(message, code = ErrorCode.INTERNAL_ERROR, status = HttpStatus.INTERNAL_SERVER_ERROR, details) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.status = status;
        this.details = details;
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    /**
     * Convert API exception to API error response format
     */
    toApiError() {
        return {
            code: this.code,
            message: this.message,
            status: this.status,
            details: this.details,
        };
    }
}
/**
 * Validation error
 * Thrown when request validation fails
 */
export class ValidationError extends ApiException {
    constructor(message, details) {
        super(message, ErrorCode.VALIDATION_ERROR, HttpStatus.UNPROCESSABLE_ENTITY, details);
    }
}
/**
 * Authentication error
 * Thrown when authentication fails
 */
export class AuthenticationError extends ApiException {
    constructor(message = 'Invalid credentials') {
        super(message, ErrorCode.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }
}
/**
 * Authorization error
 * Thrown when user doesn't have permissions
 */
export class AuthorizationError extends ApiException {
    constructor(message = 'Insufficient permissions') {
        super(message, ErrorCode.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }
}
/**
 * Not found error
 * Thrown when a requested resource doesn't exist
 */
export class NotFoundError extends ApiException {
    constructor(resource) {
        super(`${resource} not found`, ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
}
/**
 * Conflict error
 * Thrown when there's a resource conflict (e.g., unique constraint violation)
 */
export class ConflictError extends ApiException {
    constructor(message) {
        super(message, ErrorCode.RESOURCE_ALREADY_EXISTS, HttpStatus.CONFLICT);
    }
}
/**
 * Rate limit error
 * Thrown when a client exceeds rate limits
 */
export class RateLimitError extends ApiException {
    constructor(message = 'Rate limit exceeded') {
        super(message, ErrorCode.RATE_LIMIT_EXCEEDED, HttpStatus.TOO_MANY_REQUESTS);
    }
}
/**
 * Database error
 * Thrown when a database operation fails
 */
export class DatabaseError extends ApiException {
    constructor(message) {
        super(message, ErrorCode.DATABASE_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
/**
 * Convert any error to an API exception
 * Ensures all errors are transformed into a standardized format
 */
export function normalizeError(error) {
    if (error instanceof ApiException) {
        return error;
    }
    if (error instanceof Error) {
        return new ApiException(error.message);
    }
    if (typeof error === 'string') {
        return new ApiException(error);
    }
    return new ApiException('An unknown error occurred');
}
