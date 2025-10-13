import dotenv from 'dotenv';
dotenv.config();

const env = {
    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        pass: process.env.DB_PASS,
        name: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    },
    jwt: {
        secret: process.env.JWT_SECRET
    },
    server: {
        port: process.env.PORT || 3000
    }
};

export default env;