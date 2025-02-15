import express from 'express';
import * as taskController from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { deleteCache } from '../config/redis.js';
import Task from '../models/Task.js';

export const router = express.Router();

router.use(authenticate);

// GET routes with caching (cache for 5 minutes)
router.get('/', cacheMiddleware(300), taskController.getTasks);
router.get('/:id', cacheMiddleware(300), taskController.getTask);

// Clear cache when data is modified
const clearTaskCache = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await deleteCache(`${userId}:/api/tasks`);
    if (req.params.id) {
      await deleteCache(`${userId}:/api/tasks/${req.params.id}`);
    }
    next();
  } catch (error) {
    console.error('Clear Cache Error:', error);
    next();
  }
};

// POST, PUT, DELETE routes with cache clearing
router.post('/', clearTaskCache, taskController.createTask);
router.put('/:id', clearTaskCache, taskController.updateTask);
router.delete('/:id', clearTaskCache, taskController.deleteTask); 