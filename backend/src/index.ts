import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import connectDB from './config/database';
import exampleRoute from './routes/exampleRoute';
import authRoutes from './routes/authRoutes';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/example', exampleRoute);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Dutch Test Prep API');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});