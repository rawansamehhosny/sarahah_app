
import mongoose from 'mongoose';
import envConfig from '../config/env.config.js';
const databaseURI = envConfig.db.Mongo_URI;

const dbconnect = async () => {
    try {
        await mongoose.connect(databaseURI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

export default dbconnect;

