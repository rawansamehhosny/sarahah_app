import envConfig from "../config/env.config.js";

const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.cause?.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    if (envConfig.app.NODE_ENV === 'dev') {
        console.error(err);
        return res.status(statusCode).json({
            success: false,
            message,
            stack: err.stack
        });
    }else {
        return res.status(statusCode).json({
            success: false,
            message
        });
    }
}

export default globalErrorHandler;