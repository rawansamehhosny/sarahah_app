import { createClient } from 'redis';
import envConfig from '../config/env.config.js';

// Create a Redis client using in redis service layer onlyyyyy and then use it in business logic layer
export const redisClient = createClient({
    url: envConfig.redis.url
});

//in main.js
export const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (error) {
        console.error('Error connecting to Redis:', error);
    }
}; 