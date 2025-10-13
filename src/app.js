import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import sequelize from './config/db.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api/auth',authRoutes);

app.get('/',(req,res)=>{
    res.send('Auth microservice running !!');
})

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
    });

app.use('/uploads', express.static('uploads'));