import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import redisClient from './config/redis.js';
import authRoutes from './routes/authRoutes.js';
import { router as taskRoutes } from './routes/taskRoutes.js';
import { router as pathRoutes } from './routes/pathRoutes.js';
import aiRoutes from './routes/ai.js';
import userPreferenceRoutes from './routes/userPreferenceRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Initialize database and Redis
const initializeServices = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('MongoDB connected successfully');

    // Redis client is already connected in redis.js
    console.log('Redis client initialized');

    // Register routes
    app.use('/api/auth', authRoutes);
    app.use('/api/tasks', taskRoutes);
    app.use('/api/paths', pathRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/preferences', userPreferenceRoutes);
    console.log('Routes registered successfully');

    // Health check route
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime(),
        redis: redisClient.isReady ? 'connected' : 'disconnected'
      });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ message: 'Something broke!' });
    });

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
};

// Start the application
initializeServices(); 