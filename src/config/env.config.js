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
        user:{

            accessSecret: process.env.JWT_ACCESS_SECRET_USER,
            accessExpiration: process.env.JWT_ACCESS_EXP_USER,

            refreshSecret: process.env.JWT_REFRESH_SECRET_USER,
            refreshExpiration: process.env.JWT_REFRESH_EXP_USER
           
        },  

        admin: {
            accessSecret: process.env.JWT_ACCESS_SECRET_ADMIN,
            accessExpiration: process.env.JWT_ACCESS_EXP_ADMIN,
            
            refreshSecret: process.env.JWT_REFRESH_SECRET_ADMIN,
            refreshExpiration: process.env.JWT_REFRESH_EXP_ADMIN
        }
    },
    
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI
    }

}

export default envConfig; 