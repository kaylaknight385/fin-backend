import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

//middleware
app.use(cors({
    origin: 'http://localhost:5173', //frontend URL
    credentials: true
}));
app.use(express.json());

//my routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import transactionRoutes from './routes/transactions.js';
import budgetRoutes from './routes/budgets.js';
import cashbackRoutes from './routes/cashback.js';

//mounting my routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/cashback', cashbackRoutes);


//test routes no auth needed
app.get('/api/test', (req, res) => {
    res.json({message: 'SERVER RUNNING AYYYYYYYE!'});
});




//error handler
app.use(errorHandler);
const PORT = process.env.PORT || 5000;

//start server and connect to database
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
});