import express from 'express';
import authRoutes from '../routes/authRoutes.js';
import { router as taskRoutes } from '../routes/taskRoutes.js';
import { router as pathRoutes } from '../routes/pathRoutes.js';
import { router as aiRoutes } from '../routes/ai.js';

export function configureRoutes(app) {
  // API Router
  const apiRouter = express.Router();
  app.use('/api', apiRouter);

  // Mount routes
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/tasks', taskRoutes);
  apiRouter.use('/paths', pathRoutes);
  apiRouter.use('/ai', aiRoutes);

  // Health check route
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime()
    });
  });

  return app;
} 