import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import { router as taskRoutes } from './routes/taskRoutes.js';
import { router as pathRoutes } from './routes/pathRoutes.js';
import aiRoutes from './routes/ai.js';
import userPreferenceRoutes from './routes/userPreferenceRoutes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database and services
const initializeServices = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('MongoDB connected successfully');

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
        uptime: process.uptime()
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

// Start the server
initializeServices(); 