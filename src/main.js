import envConfig from './config/env.config.js';
import express from 'express';
import dbconnect from './DB/db.connection.js';
import * as controllers from './modules/index.js';
import globalErrorHandler from './middelwares/global-error-handler-middleware.js';
import { encryptData, decryptData } from './Utils/crypto.util.js';
import fs from 'fs';
import crypto from 'crypto';
import cors from 'cors';
import { connectRedis } from './config/redis.config.js';
import * as redisService from './services/redis.services.js';
import { corsOptions } from './config/cors.config.js';
import helmet from 'helmet';

const app = express();
app.use(express.json());

const port = envConfig.app.port;

// الـ Dynamic Middleware الممتازة لتفادي مشاكل الـ Async وقت القومة
app.use(async (req, res, next) => {
  try {
    const { limiter } = await import("./config/limiter.config.js");
    return limiter(req, res, next);
  } catch (error) {
    next(error);
  }
});

// CORS & Security configuration
app.use(cors(corsOptions), helmet());

// Serve static files from the uploads directory
app.use("/uploads", express.static("uploads")); // 💡 تعديل بسيط: أضفت الـ slash عشان المسار يبقى مظبوط "/uploads"

// test route
app.get('/', (req, res) => {
  res.send('sarahah app is running');
});

// Register controllers
app.use('/api/auth', controllers.authcontroller);
app.use('/api/users', controllers.usercontroller);
app.use('/api/messages', controllers.messagecontroller);

// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'wrong route' });
});

// Global error handling middleware
app.use(globalErrorHandler);

// Start the server after connecting to the database and Redis
const startApp = async () => {
  try {
    await dbconnect();
    await connectRedis();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting the application:', error);
  }
};

startApp();
