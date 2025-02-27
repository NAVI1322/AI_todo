const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
  register, 
  login, 
  getProfile, 
  updateProfile 
} = require('../controllers/auth');

// Auth routes
router.post('/register', register);
router.post('/login', login);

// Profile routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

module.exports = router; 