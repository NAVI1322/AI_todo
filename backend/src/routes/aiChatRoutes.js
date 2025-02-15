import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Apply auth middleware to all routes
router.use(authMiddleware);

// Chat with AI
router.post('/chat', async (req, res) => {
  console.log('Received chat request:', {
    message: req.body.message,
    historyLength: req.body.history?.length || 0,
    user: req.user?._id
  });

  try {
    const { message, history } = req.body;

    if (!message) {
      console.log('Missing message in request');
      return res.status(400).json({ message: 'Message is required' });
    }

    // Convert history to OpenAI format if provided
    const messages = [
      {
        role: "system",
        content: `You are an AI assistant for TaskForge, a learning path creation platform. Keep all responses concise and under 3-4 lines when possible.

Key functions:
• Create and manage learning paths
• Guide users through platform features
• Help with study planning
• Track learning progress

Important guidelines:
- Keep responses brief and direct
- Use **bold text** for key terms
- Limit responses to essential information
- Use bullet points for steps
- Stay focused on learning topics

Example responses (keep this length):
"How do I create a path?"
• Click the **Create Path** button
• Enter your **topic** and **duration**
• Click **Generate**

"Where are my paths?"
• Go to **Dashboard** > **My Paths**
• Click any path to view progress

Remember:
• Be concise
• Use **bold** for emphasis
• Focus on actions users can take`
      },
      ...(history || []).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: "user",
        content: message
      }
    ];

    console.log('Sending request to OpenAI:', {
      model: process.env.AI_MODEL || "gpt-3.5-turbo",
      messageCount: messages.length
    });

    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = completion.choices[0].message.content;
    console.log('Received response from OpenAI');

    res.json({
      response: response,
      role: 'assistant'
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    
    if (error.response?.status === 429) {
      res.status(429).json({
        message: 'Too many requests',
        error: 'Please try again in a few minutes'
      });
    } else {
      res.status(500).json({
        message: 'Failed to get AI response',
        error: error.message
      });
    }
  }
});

export default router; 