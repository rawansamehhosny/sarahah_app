import envConfig from "../config/env.config.js";

const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || err.cause?.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const errorCode = err.code || (typeof err.cause === 'string' ? err.cause : 'INTERNAL_SERVER_ERROR');

    if (envConfig.app.NODE_ENV === 'dev') {
        console.error(err);
        return res.status(statusCode).json({
            success: false,
            message,
            code: errorCode,
            stack: err.stack
        });
    }else {
        return res.status(statusCode).json({
            success: false,
            message,
            code: errorCode
        });
    }
}

export default globalErrorHandler;