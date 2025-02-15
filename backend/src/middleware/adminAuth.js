import User from '../models/User.js';

export const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || !user.isAdminUser()) {
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    req.isAdmin = true;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Admin authentication failed' });
  }
}; 