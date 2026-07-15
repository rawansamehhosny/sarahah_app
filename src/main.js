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
    console.error("Critical error during app startup:", error);
  }
};

startApp();

// Test encryption and decryption
// const encrypt= encryptData('Hello Ahmed');
// console.log('Encrypted:', encrypt);

// const decrypt = decryptData(encrypt);
// console.log('Decrypted:', decrypt);


//assymitric encryption
// if (!fs.existsSync('./keys')) {
//   fs.mkdirSync('./keys');
// } 
// if (fs.existsSync('./keys/private.pem') && fs.existsSync('./keys/public.pem')) {
//   const privateKey = fs.readFileSync('./keys/private.pem', 'utf8');
//   const publickey = fs.readFileSync('./keys/public.pem', 'utf8');
//   console.log('key already generated');
// }else {
//   const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
//     modulusLength: 2048,
//     publicKeyEncoding: {
//       type: 'pkcs1',
//       format: 'pem'
//     },
//     privateKeyEncoding: {
//       type: 'pkcs1',
//       format: 'pem'
//     }
//   });
//   // Save the generated keys to files
//   fs.writeFileSync('./keys/public.pem', publicKey);
//   fs.writeFileSync('./keys/private.pem', privateKey);
//   console.log('Keys generated and saved.');
// }


// redisService.set('testKey', 'Hello Redis', { EX: 60})
//   .then(() => redisService.get('testKey'))
//   .then(value => console.log('Value from Redis:', value))
//   .catch(err => console.error('Redis error:', err));

  // redisService.expire('testKey', 30)
  // .then(() => redisService.ttl('testKey'))
  // .then(ttl => console.log('TTL of testKey:', ttl))
  // .catch(err => console.error('Redis error:', err));
// redisService.ttl('testKey')
//   .then(ttl => console.log('TTL of testKey:', ttl))
//   .catch(err => console.error('Redis error:', err));