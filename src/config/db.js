import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

let sequelize;

sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST || 'localhost', // 'host' bir adres olmalı
        port: process.env.DB_PORT || 3307, // 'port' bir numara olmalı
        dialect: 'mysql',
        logging: false,
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        await sequelize.sync(); // 'force: true' kaldırıldı
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

export default sequelize;
export { connectDB };