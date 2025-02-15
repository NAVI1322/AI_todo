import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);

// Profile routes (protected)
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router; 