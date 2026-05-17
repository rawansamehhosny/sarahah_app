import envConfig from '../config/env.config.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import fs from 'fs';

//Symmetric encryption

export const encryptData = (plainText) => {
    const iv = crypto.randomBytes(envConfig.encryption.iv);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(envConfig.encryption.secret_key, 'hex'), iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

export const decryptData = (encryptedText) => {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv= Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(envConfig.encryption.secret_key, 'hex'), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

//Password hashing
export const hashPassword = async (password) => {
    return await bcrypt.hash(password, envConfig.encryption.saltRounds);
}

export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
}

//Asymmetric encryption
const publicKey = fs.readFileSync('./keys/public.pem', 'utf8');
const privateKey = fs.readFileSync('./keys/private.pem', 'utf8');

// Asymmetric publickey functions
export const encryptWithPublicKey = (plainText) => {
    const encrypted = crypto.publicEncrypt({
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
    }, Buffer.from(plainText, 'utf8'));
return encrypted.toString('hex');
}

// Decryption with private key
export const decryptWithPrivateKey = (encryptedText) => {
    const decrypted = crypto.privateDecrypt(
        {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
        },Buffer.from(encryptedText, 'hex'));
    return decrypted.toString('utf8');
}

