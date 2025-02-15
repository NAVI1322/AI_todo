import express from 'express';
import Path from '../models/Path.js';
import { authenticate } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { deleteCache } from '../config/redis.js';
// import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize OpenAI configuration
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// Apply auth middleware to all routes
router.use(authenticate);

// Helper function to format resources
function formatResource(url) {
  return {
    title: 'Learning Resource',
    url: url,
    type: 'website'
  };
}

// Format the entire path response
function formatPathResponse(pathData) {
  return {
    ...pathData,
    days: pathData.days.map(day => ({
      ...day,
      tasks: day.tasks.map(task => ({
        ...task,
        resources: task.resources.map(formatResource)
      }))
    }))
  };
}

// Clear cache when data is modified
const clearPathCache = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    await deleteCache(`${userId}:/api/paths`);
    if (req.params.id) {
      await deleteCache(`${userId}:/api/paths/${req.params.id}`);
    }
    next();
  } catch (error) {
    console.error('Clear Cache Error:', error);
    next();
  }
};

// Generate a learning path using AI
router.post('/generate', async (req, res) => {
  try {
    const { topic, duration } = req.body;
    
    // Validate input
    if (!topic || !duration) {
      return res.status(400).json({ message: 'Topic and duration are required' });
    }

    // Create system message for path generation
    const systemMessage = {
      role: "system",
      content: `You are an expert curriculum designer for TaskForge learning platform. Create a structured ${duration}-day learning path for the topic: ${topic}.

Important guidelines:
1. Focus purely on educational content and learning steps
2. Include specific, actionable tasks for each day
3. Provide relevant learning resources (documentation, tutorials, exercises)
4. Structure content from basic to advanced concepts
5. Include practice exercises and knowledge checks

Return ONLY a JSON object with NO additional formatting or markdown, using this exact structure:
{
  "title": "Learning Path Title",
  "description": "Clear description of what will be learned",
  "difficulty": "beginner/intermediate/advanced",
  "days": [
    {
      "day": 1,
      "title": "Descriptive Day Title",
      "description": "Clear overview of day's learning objectives",
      "tasks": [
        {
          "title": "Specific task title",
          "description": "Detailed steps to complete the task",
          "completed": false,
          "resources": ["URL to relevant learning material"]
        }
      ]
    }
  ]
}

Requirements:
1. Return ONLY the JSON object, no markdown, no \`\`\`json tags, no explanations
2. Each day MUST have a "day" field with a number
3. Tasks must be specific and achievable within a day
4. Resources must be relevant learning materials
5. Keep descriptions clear and actionable`
    };

    // Get completion from OpenAI
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-3.5-turbo",
      messages: [
        systemMessage,
        { role: "user", content: `Create a ${duration}-day learning path for ${topic}. Remember to return ONLY the JSON object.` }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    // Get the response content and clean it
    let responseContent = completion.choices[0].message.content;
    
    // Remove any markdown formatting if present
    responseContent = responseContent.replace(/```json\n?|\n?```/g, '').trim();

    // Parse the response
    try {
      const pathData = JSON.parse(responseContent);
      const formattedPath = formatPathResponse(pathData);
      
      // Add user reference
      formattedPath.user = req.user._id;

      // Ensure each day has the required day number
      formattedPath.days = formattedPath.days.map((day, index) => ({
        ...day,
        day: index + 1
      }));

      // Create and save the path
      const path = new Path(formattedPath);
      const savedPath = await path.save();

      res.status(201).json(savedPath);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Response Content:', responseContent);
      res.status(500).json({ 
        message: 'Failed to generate valid learning path',
        reason: 'AI response format error',
        suggestion: 'Please try again with a more specific topic'
      });
    }
  } catch (error) {
    console.error('Error generating path:', error);
    
    // Handle different types of errors
    if (error instanceof SyntaxError) {
      res.status(500).json({ 
        message: 'Failed to generate valid learning path',
        reason: 'AI response format error',
        suggestion: 'Please try again with a more specific topic'
      });
    } else if (error.response?.status === 429) {
      res.status(429).json({ 
        message: 'Too many requests',
        reason: 'API rate limit exceeded',
        suggestion: 'Please try again in a few minutes'
      });
    } else {
      res.status(500).json({ 
        message: error.message || 'Failed to generate learning path'
      });
    }
  }
});

// GET routes with caching (cache for 10 minutes)
router.get('/', cacheMiddleware(600), async (req, res) => {
  try {
    const paths = await Path.find().sort({ createdAt: -1 });
    res.json(paths);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', cacheMiddleware(600), async (req, res) => {
  try {
    const path = await Path.findById(req.params.id);
    if (!path) {
      return res.status(404).json({ message: 'Path not found' });
    }
    res.json(formatPathResponse(path));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST, PUT, DELETE routes with cache clearing
router.post('/', clearPathCache, async (req, res) => {
  try {
    const path = new Path(req.body);
    const savedPath = await path.save();
    res.status(201).json(savedPath);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', clearPathCache, async (req, res) => {
  try {
    const path = await Path.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!path) {
      return res.status(404).json({ message: 'Path not found' });
    }
    res.json(path);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', clearPathCache, async (req, res) => {
  try {
    const path = await Path.findByIdAndDelete(req.params.id);
    if (!path) {
      return res.status(404).json({ message: 'Path not found' });
    }
    res.json({ message: 'Path deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task completion status
router.put('/:id/days/:dayIndex/tasks/:taskId/complete', async (req, res) => {
  try {
    console.log('Updating task completion:', {
      pathId: req.params.id,
      dayIndex: req.params.dayIndex,
      taskId: req.params.taskId,
      completed: req.body.completed,
      userId: req.user._id
    });

    const path = await Path.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!path) {
      console.log('Path not found');
      return res.status(404).json({ message: 'Path not found' });
    }

    const dayIndex = parseInt(req.params.dayIndex);
    if (!path.days[dayIndex]) {
      console.log('Day not found');
      return res.status(404).json({ message: 'Day not found' });
    }

    const task = path.days[dayIndex].tasks.id(req.params.taskId);
    if (!task) {
      console.log('Task not found');
      return res.status(404).json({ message: 'Task not found' });
    }

    task.completed = req.body.completed;
    await path.save();

    console.log('Task updated successfully');
    res.json(path);
  } catch (error) {
    console.error('Error updating task completion:', error);
    res.status(400).json({ message: error.message });
  }
});

export { router }; 