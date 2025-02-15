import Path from '../models/Path.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '../../.env') });

// Initialize OpenAI with error handling
const initializeOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not defined in environment variables');
  }
  return new OpenAI({
    apiKey: apiKey
  });
};

// Initialize OpenAI
let openai;
try {
  openai = initializeOpenAI();
  console.log('OpenAI initialized successfully');
} catch (error) {
  console.error('Failed to initialize OpenAI:', error);
  process.exit(1);
}

export const getPaths = async (req, res) => {
  try {
    const paths = await Path.find({ user: req.user.userId });
    res.json(paths);
  } catch (error) {
    console.error('Error fetching paths:', error);
    res.status(500).json({ message: 'Failed to fetch learning paths' });
  }
};

export const getPath = async (req, res) => {
  try {
    console.log('\n=== Get Path Operation Start ===');
    console.log('Path ID:', req.params.id);
    console.time('Database Query');
    
    const path = await Path.findById(req.params.id);
    console.timeEnd('Database Query');
    
    console.log('Found Path:', path ? 'Yes' : 'No');
    if (!path) {
      console.log('Path not found');
      console.log('=== Get Path Operation End ===\n');
      return res.status(404).json({ message: 'Path not found' });
    }

    console.log('Path Data:', JSON.stringify(path, null, 2));
    console.log('=== Get Path Operation End ===\n');
    
    res.json(formatPathResponse(path));
  } catch (error) {
    console.error('Get path error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createPath = async (req, res) => {
  try {
    const { title, description, days } = req.body;
    
    const path = await Path.create({
      user: req.user.userId,
      title,
      description,
      days: days.map((day, index) => ({
        ...day,
        day: index + 1,
        tasks: day.tasks.map(task => ({
          ...task,
          completed: false
        }))
      }))
    });

    res.status(201).json(path);
  } catch (error) {
    console.error('Error creating path:', error);
    res.status(500).json({ message: 'Failed to create learning path' });
  }
};

export const updatePath = async (req, res) => {
  try {
    const path = await Path.findOne({ _id: req.params.id, user: req.user.userId });
    if (!path) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    const { title, description, days } = req.body;
    
    if (title) path.title = title;
    if (description) path.description = description;
    if (days) {
      path.days = days.map((day, index) => ({
        ...day,
        day: index + 1
      }));
    }

    await path.save();
    res.json(path);
  } catch (error) {
    console.error('Error updating path:', error);
    res.status(500).json({ message: 'Failed to update learning path' });
  }
};

export const deletePath = async (req, res) => {
  try {
    const path = await Path.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!path) {
      return res.status(404).json({ message: 'Learning path not found' });
    }
    res.json({ message: 'Learning path deleted successfully' });
  } catch (error) {
    console.error('Error deleting path:', error);
    res.status(500).json({ message: 'Failed to delete learning path' });
  }
};

export const updatePathTask = async (req, res) => {
  try {
    const { dayIndex, taskId, completed } = req.body;
    
    const path = await Path.findOne({ _id: req.params.id, user: req.user.userId });
    if (!path) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    if (!path.days[dayIndex]) {
      return res.status(400).json({ message: 'Invalid day index' });
    }

    const task = path.days[dayIndex].tasks.id(taskId);
    if (!task) {
      return res.status(400).json({ message: 'Task not found' });
    }

    task.completed = completed;
    await path.save();

    res.json(path);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

export const generateAIPath = async (req, res) => {
  try {
    const { topic, duration } = req.body;
    console.log('Received request:', { 
      topic, 
      duration,
      type: typeof duration,
      userId: req.user?.userId 
    });

    if (!topic || duration === undefined) {
      return res.status(400).json({
        message: "Missing required parameters",
        reason: "Both topic and duration are required",
        received: { topic, duration }
      });
    }

    const numDuration = Number(duration);
    if (!Number.isInteger(numDuration) || numDuration < 1 || numDuration > 30) {
      return res.status(400).json({
        message: "Invalid duration",
        reason: "Duration must be a whole number between 1 and 30",
        received: { duration, converted: numDuration }
      });
    }

    const prompt = `Create a ${numDuration}-day learning path for: ${topic}`;
    console.log('Using prompt:', prompt);

    // First, check if we can create a learning path for this topic
    console.log('Starting capability check with OpenAI...');
    const capabilityCheck = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI capability validator for a learning path creation system. Your job is to determine if we can create a proper learning path for the given request.

IMPORTANT GUIDELINES:
1. Default to accepting topics if they are:
   - Languages (programming or natural languages)
   - Academic subjects
   - Technical skills
   - Creative skills
   - Professional skills
   - Hobbies that can be learned online

2. Only return canCreate: false if the topic is:
   - Physically impossible
   - Requires mandatory in-person training
   - Dangerous or harmful
   - Too vague to create a meaningful path

3. For accepted topics:
   - If it's broad, explain how you'll structure it
   - If it's specific, outline the approach
   - For languages, focus on beginner-friendly resources

Respond with a JSON object containing only these fields:
{
  "canCreate": boolean,
  "reason": string (explain why it's accepted/rejected),
  "suggestedApproach": string (for accepted topics, outline the learning strategy)
}

Keep the response concise and properly escaped, without newlines or special characters in the strings.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3
    });

    console.log('Received capability check response:', capabilityCheck.choices[0].message);

    let capability;
    try {
      // Clean the response before parsing
      const cleanedResponse = capabilityCheck.choices[0].message.content
        .replace(/\n/g, ' ')
        .replace(/\r/g, '')
        .replace(/\\/g, '')
        .replace(/\t/g, ' ');
      
      capability = JSON.parse(cleanedResponse);
      console.log('Parsed capability check result:', capability);
    } catch (error) {
      console.error('Failed to parse capability check response:', {
        error: error.message,
        response: capabilityCheck.choices[0].message.content
      });
      return res.status(500).json({
        message: "Failed to validate topic",
        error: "Invalid response from AI",
        details: error.message
      });
    }
    
    if (!capability.canCreate) {
      console.log('Cannot create path:', capability);
      return res.status(400).json({
        message: "Unable to create learning path",
        reason: capability.reason,
        suggestion: capability.suggestedApproach
      });
    }

    // If we can create the path, proceed with generation
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "system",
          content: `You are a learning path creator specializing in creating detailed, practical learning paths with high-quality resources. 
          Create a detailed ${numDuration}-day learning path based on the user's request.

          IMPORTANT RESOURCE GUIDELINES:
          1. Each resource MUST be a real, accessible online resource with ACTUAL URLs, for example:
             For Languages:
             - Duolingo: "https://www.duolingo.com/course/ru/en/Learn-Russian"
             - YouTube: "https://www.youtube.com/watch?v=AYRZupz6rdw"
             - Language Sites: "https://www.russianpod101.com/", "https://www.lingodeer.com"
             
             For Programming:
             - Official Docs: "https://doc.rust-lang.org/book/"
             - Video Courses: "https://www.youtube.com/watch?v=5C_HPTJg5ek"
             - Interactive: "https://exercism.io/tracks/rust"
          
          2. For language learning, prefer these platforms:
             - Apps: Duolingo, Babbel, Busuu, LingoDeer
             - Video: YouTube channels (Russian Made Easy, Real Russian Club)
             - Podcasts: RussianPod101, Slow Russian
             - Practice: iTalki, Tandem, HelloTalk
             - Courses: Coursera, edX, Udemy
          
          3. Each resource MUST have:
             - A descriptive title matching the actual content
             - A working URL to the specific content
             - A clear explanation of what to learn from it
          
          4. For language paths:
             - Start with alphabet and basic pronunciation
             - Include listening and speaking practice
             - Add cultural context and real-world usage
             - Mix theory and practical conversation
          
          5. NO placeholder URLs or generic resources
          
          VALID RESOURCE TYPES:
          - 'video' (for video tutorials/courses)
          - 'app' (for language learning apps)
          - 'podcast' (for audio lessons)
          - 'course' (for structured online courses)
          - 'practice' (for interactive exercises)
          - 'document' (for reading materials)
          - 'website' (for other web resources)
          
          Follow this structure exactly:
          {
            "title": "Learning path title",
            "description": "Overall path description",
            "difficulty": "beginner|intermediate|advanced",
            "prerequisites": ["prerequisite1", "prerequisite2"],
            "days": [
              {
                "day": number,
                "title": "Day N: Specific Focus Area",
                "description": "Detailed description of day's objectives",
                "tasks": [
                  {
                    "title": "Specific Task Title",
                    "description": "Detailed task description with clear instructions",
                    "duration": "estimated time in minutes",
                    "resources": [
                      {
                        "title": "Specific Resource Title",
                        "type": "video|app|podcast|course|practice|document|website",
                        "description": "How this resource helps with the task",
                        "url": "actual_url_to_resource"
                      }
                    ]
                  }
                ]
              }
            ]
          }`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });

    let pathData;
    try {
      pathData = JSON.parse(completion.choices[0].message.content);
      console.log('Generated path data:', JSON.stringify(pathData, null, 2));
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return res.status(500).json({
        message: "Failed to generate path",
        error: "Invalid response from AI"
      });
    }

    // Validate the path data structure
    if (!pathData.title || !pathData.description || !Array.isArray(pathData.days)) {
      console.error('Invalid path structure:', pathData);
      return res.status(400).json({
        message: "Invalid path structure",
        error: "Missing required fields"
      });
    }

    if (pathData.days.length !== numDuration) {
      console.error(`Wrong number of days: expected ${numDuration}, got ${pathData.days.length}`);
      return res.status(400).json({
        message: "Invalid path structure",
        error: `Wrong number of days: expected ${numDuration}, got ${pathData.days.length}`
      });
    }

    // Add day numbers and task completion status
    const processedPathData = {
      ...pathData,
      days: pathData.days.map((day, index) => ({
        ...day,
        day: index + 1,
        tasks: (day.tasks || []).map(task => ({
          ...task,
          completed: false
        }))
      }))
    };

    console.log('Processed path data:', JSON.stringify(processedPathData, null, 2));

    // Create the path in the database
    const path = await Path.create({
      user: req.user.userId,
      ...processedPathData
    });

    res.status(201).json(path);
  } catch (error) {
    console.error('Error generating AI path:', error);
    
    if (error.name === 'ValidationError') {
      console.error('Validation error details:', error.errors);
      return res.status(400).json({ 
        message: 'Invalid path data structure',
        details: error.message,
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }

    if (error.response?.data) {
      console.error('OpenAI API error:', error.response.data);
      return res.status(500).json({
        message: 'OpenAI API error',
        error: error.response.data
      });
    }

    res.status(500).json({ 
      message: 'Failed to generate learning path',
      error: error.message
    });
  }
}; 