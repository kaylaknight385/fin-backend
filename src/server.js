import express from 'express';
import dotenv from 'dotenv';
import {connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();

//middleware
app.use(express.json());

//test routes no auth needed
app.get('/api/test', (req, res) => {
    res.json({message: 'SERVER RUNNING AYYYYYYYE!'});
});


// test protected route auth needed
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'You are authenticated!',
    user: req.user 
  });
});

//error handler
app.use(errorHandler);
const PORT = process.env.PORT || 5000;

connectDB().then (() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});