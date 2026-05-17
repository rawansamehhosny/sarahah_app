import {config} from "dotenv";
config({ path: [`.${process.env.NODE_ENV}.env`, '.env'] });

const envConfig = {
    app:{
        NODE_ENV: process.env.NODE_ENV || 'dev',
        port: process.env.PORT || 8000,
    },
    db: {
        Mongo_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/myapp',
    },
    encryption: {
        secret_key: process.env.ENCRYPTION_KEY || 'mysecretkey',
        saltRounds: parseInt(process.env.ENCRYPTION_SALT_ROUNDS) || 10,
        iv: parseInt(process.env.IV) || 16
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '5d'
    }
}

export default envConfig; 