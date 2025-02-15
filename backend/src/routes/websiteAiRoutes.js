import express from 'express';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Website AI chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // System message to define AI's role and knowledge
    const systemMessage = {
      role: "system",
      content: `You are an AI assistant for the AI TODO Learning Platform. Here are the key details about the platform:

Pricing Plans:
- Free Plan: Up to 5 learning paths, basic features
- Premium Plan: $10/month, unlimited paths, advanced AI customization, priority support

Features:
- AI-generated personalized learning paths
- Progress tracking and analytics
- Email notifications and weekly digests
- Task management and completion tracking
- Dark/light mode themes
- Mobile-responsive design

Your role is to:
1. Answer questions about the platform's features and pricing
2. Provide suggestions for using the platform effectively
3. Help users understand the benefits of premium features
4. Be friendly and professional in your responses
5. Direct users to appropriate features based on their needs

Remember to be helpful, concise, and accurate in your responses.`
    };

    // Get chat completion from OpenAI
    const completion = await openai.createChatCompletion({
      model: process.env.AI_MODEL || "gpt-3.5-turbo",
      messages: [
        systemMessage,
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    // Send response back to client
    res.json({
      message: completion.data.choices[0].message.content,
      role: 'assistant'
    });

  } catch (error) {
    console.error('Website AI Chat Error:', error);
    res.status(500).json({
      error: 'Failed to get AI response',
      details: error.message
    });
  }
});

export default router; 