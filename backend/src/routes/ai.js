import express from 'express';
import dotenv from 'dotenv';
import { authenticate } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

router.use(authenticate);

// AI chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
      temperature: 0.7,
      max_tokens: 1000
    });

    res.json({
      message: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ message: 'Failed to process AI request' });
  }
});

export default router; 