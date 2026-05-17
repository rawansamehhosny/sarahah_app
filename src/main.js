
import envConfig from './config/env.config.js';
import express from 'express';
import dbconnect from './DB/db.connection.js';
import * as controllers from './modules/index.js';
import globalErrorHandler from './middelwares/global-error-handler-middleware.js';
import {encryptData, decryptData} from './Utils/crypto.util.js';
import fs from 'fs';
import crypto from 'crypto';

const app = express();
app.use(express.json());
const port =envConfig.app.port;

// Connect to the database
dbconnect();

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
  res.status(404).json({ message: 'wrong route'});
});

// Global error handling middleware
app.use(globalErrorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

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