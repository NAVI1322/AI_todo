import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as subscriptionController from '../controllers/subscriptionController.js';

const router = express.Router();

// Create Stripe checkout session
router.post('/create-checkout-session', authenticate, subscriptionController.createCheckoutSession);

// Handle Stripe webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), subscriptionController.handleWebhook);

export default router; 