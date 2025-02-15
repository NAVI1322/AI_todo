import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/adminAuth.js';
import User from '../models/User.js';
import Path from '../models/Path.js';

const router = express.Router();

// Apply auth middlewares
router.use(authenticate);
router.use(adminMiddleware);

// Get admin dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await Promise.all([
      User.getAdminStats(),
      Path.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
      Path.find().sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      userStats: stats[0],
      totalPaths: stats[1],
      recentUsers: stats[2],
      recentPaths: stats[3]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user details
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userPaths = await Path.find({ user: req.params.id });
    res.json({ user, paths: userPaths });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role, isAdmin } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isAdmin },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all paths
router.get('/paths', async (req, res) => {
  try {
    const paths = await Path.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(paths);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete all user's paths
    await Path.deleteMany({ user: req.params.id });
    
    res.json({ message: 'User and associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 