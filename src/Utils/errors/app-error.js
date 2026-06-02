export class httpAppError extends Error {
    constructor(message = "An error occurred", statusCode = 500, cause = null, details = {}) {
        super(message);
        this.statusCode = statusCode;
        this.cause = cause;
        this.details = details;
    }};