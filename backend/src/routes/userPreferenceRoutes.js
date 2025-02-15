import express from 'express';
import { userPreferenceController } from '../controllers/userPreferenceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', userPreferenceController.getPreferences);
router.patch('/settings', userPreferenceController.updateSettings);
router.post('/favorites', userPreferenceController.toggleFavorite);
router.post('/recent', userPreferenceController.addToRecent);

export default router; 