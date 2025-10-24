import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import sequelize from './config/db.js';
import helmet from "helmet";
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';
import {fileURLToPath} from "node:url";
import path from "path";

dotenv.config();

const app = express();

app.use(cors())
app.use(helmet());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname,'..','uploads')));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Çok fazla istek gönderdiniz, lütfen 15 dk sonra tekrar deneyin!'
});
app.use(limiter);

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Auth_Service running!!');
});

const PORT = process.env.PORT || 3000;

sequelize.sync()
    .then(() => {
        console.log('Database connected successfully');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
        process.exit(1);
    });

export default app;