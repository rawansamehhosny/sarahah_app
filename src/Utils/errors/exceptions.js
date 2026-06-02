import { httpAppError } from "./app-error.js";

// 404 Not Found Error
export class NotFoundError extends httpAppError {
        constructor(message = "Resource not found", details = {}) {
            super(message, 404, 'NOT_FOUND', details);
        }}

// 401 Unauthorized Error
export class AuthenticationError extends httpAppError {
    constructor(message = "Authentication failed", details = {}) {
        super(message, 401, 'AUTHENTICATION_ERROR', details);
    }};

// 409 Conflict Error
export class ConflictError extends httpAppError {
    constructor(message = "Resource already exists", details = {}) {
        super(message, 409, 'CONFLICT_ERROR', details);
    }
}

// 403 Forbidden Error
export class ForbiddenError extends httpAppError {
    constructor(message = "Forbidden: You do not have permission to access this resource", details = {}) {
        super(message, 403, 'FORBIDDEN_ERROR', details);
    }
}
// 500 Internal Server Error
export class InternalServerError extends httpAppError {
    constructor(message = "An unexpected error occurred", details = {}) {
        super(message, 500, 'INTERNAL_SERVER_ERROR', details);
    }
}

// 400 Bad Request Error
export class BadRequestError extends httpAppError {
    constructor(message = 'Bad request', details = null) {
        super(message, 400, 'BAD_REQUEST', details);
    }
}