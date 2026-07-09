import cors from './env.config.js';

export const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || envConfig.cors.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token', 'refresh-token'] // Allowed headers
}