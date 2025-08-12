/**
 * HTTP Status codes
 * Common HTTP status codes used in the API
 */
export var HttpStatus;
(function (HttpStatus) {
    HttpStatus[HttpStatus["OK"] = 200] = "OK";
    HttpStatus[HttpStatus["CREATED"] = 201] = "CREATED";
    HttpStatus[HttpStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatus[HttpStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatus[HttpStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatus[HttpStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatus[HttpStatus["CONFLICT"] = 409] = "CONFLICT";
    HttpStatus[HttpStatus["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    HttpStatus[HttpStatus["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    HttpStatus[HttpStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    HttpStatus[HttpStatus["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
})(HttpStatus || (HttpStatus = {}));
/**
 * Error codes
 * Standardized error codes used across the API
 */
export var ErrorCode;
(function (ErrorCode) {
    // Authentication errors
    ErrorCode["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    ErrorCode["SESSION_EXPIRED"] = "SESSION_EXPIRED";
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    // Validation errors
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["INVALID_INPUT"] = "INVALID_INPUT";
    // Resource errors
    ErrorCode["RESOURCE_NOT_FOUND"] = "RESOURCE_NOT_FOUND";
    ErrorCode["RESOURCE_ALREADY_EXISTS"] = "RESOURCE_ALREADY_EXISTS";
    // Rate limiting
    ErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    // Server errors
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    // Database errors
    ErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
})(ErrorCode || (ErrorCode = {}));
/**
 * Validation error class
 */
export class ValidationError extends Error {
    constructor(message, field, details) {
        super(message);
        this.field = field;
        this.details = details;
        this.code = ErrorCode.VALIDATION_ERROR;
        this.status = HttpStatus.UNPROCESSABLE_ENTITY;
        this.name = 'ValidationError';
    }
}
