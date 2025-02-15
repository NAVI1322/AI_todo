import express from 'express';
import User from '../models/User.js';
import Path from '../models/Path.js';
import { sendTaskReminder, sendWeeklyProgress } from '../utils/mailer.js';
import { checkIncompleteTasks, sendWeeklyReports } from '../services/cronService.js';

const router = express.Router();

// Test route to verify the router is working
router.get('/ping', (req, res) => {
  res.json({ message: 'Test routes are working' });
});

// Test skipped days with user data
router.post('/simulate-skipped-days', async (req, res) => {
  try {
    const userEmail = 'rksharma041976@gmail.com';
    console.log('\n=== Testing Skipped Days Notification ===');
    console.log('Target email:', userEmail);

    // Find the user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log('❌ User not found for email:', userEmail);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('✅ User found:', user.name);

    // Find user's paths
    const paths = await Path.find({ user: user._id });
    if (paths.length === 0) {
      console.log('❌ No learning paths found for user');
      return res.status(404).json({ error: 'No learning paths found' });
    }
    console.log('✅ Found', paths.length, 'learning paths');

    // Process each path to find skipped days
    const pathsWithMissedDays = [];
    
    for (const path of paths) {
      console.log('\nChecking path:', path.title);
      // Get incomplete tasks from the last few days
      const incompleteDays = [];
      
      path.days.forEach((day, index) => {
        const incompleteTasks = day.tasks.filter(task => !task.completed);
        if (incompleteTasks.length > 0) {
          incompleteDays.push({
            dayNumber: index + 1,
            dayTitle: day.title,
            tasks: incompleteTasks,
            totalTasks: day.tasks.length,
            completedTasks: day.tasks.length - incompleteTasks.length
          });
        }
      });

      console.log('Found', incompleteDays.length, 'days with incomplete tasks');

      // Check for consecutive missed days
      if (incompleteDays.length >= 2) {
        console.log('⚠️ Path has', incompleteDays.length, 'consecutive missed days');
        pathsWithMissedDays.push({
          pathTitle: path.title,
          dayNumber: incompleteDays[incompleteDays.length - 1].dayNumber,
          dayTitle: incompleteDays[incompleteDays.length - 1].dayTitle,
          tasks: incompleteDays[incompleteDays.length - 1].tasks,
          totalTasks: incompleteDays[incompleteDays.length - 1].totalTasks,
          completedTasks: incompleteDays[incompleteDays.length - 1].completedTasks,
          missedDays: incompleteDays.length
        });
      }
    }

    if (pathsWithMissedDays.length > 0) {
      console.log('\n📧 Sending notification for', pathsWithMissedDays.length, 'paths with missed days');
      // Send notification for skipped days
      const result = await sendTaskReminder(userEmail, {
        name: user.name || 'User',
        paths: pathsWithMissedDays
      });

      console.log('✅ Email sent successfully');
      res.json({
        message: 'Skipped days notification sent',
        details: {
          pathsChecked: paths.length,
          pathsWithSkippedDays: pathsWithMissedDays.length,
          emailResult: {
            messageId: result.messageId,
            response: result.response
          }
        }
      });
    } else {
      console.log('\n✅ No paths with skipped days found');
      res.json({
        message: 'No skipped days found',
        details: {
          pathsChecked: paths.length
        }
      });
    }
  } catch (error) {
    console.error('❌ Error in skipped days simulation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test weekly progress with user data
router.post('/simulate-weekly-progress', async (req, res) => {
  try {
    const userEmail = 'rksharma041976@gmail.com';
    console.log('\n=== Testing Weekly Progress Report ===');
    console.log('Target email:', userEmail);

    // Find the user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log('❌ User not found for email:', userEmail);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('✅ User found:', user.name);

    // Find user's paths
    const paths = await Path.find({ user: user._id });
    if (paths.length === 0) {
      console.log('❌ No learning paths found for user');
      return res.status(404).json({ error: 'No learning paths found' });
    }
    console.log('✅ Found', paths.length, 'learning paths');

    // Calculate progress for each path
    const pathsProgress = paths.map(path => {
      const totalDays = path.days.length;
      const completedDays = path.days.filter(day => 
        day.tasks.every(task => task.completed)
      ).length;

      const progress = Math.round((completedDays / totalDays) * 100);
      console.log(`\nPath: ${path.title}`);
      console.log(`- Completed days: ${completedDays}/${totalDays}`);
      console.log(`- Progress: ${progress}%`);

      return {
        pathTitle: path.title,
        completedDays,
        totalDays,
        progress
      };
    });

    console.log('\n📧 Sending weekly progress report');
    // Send weekly progress report
    const result = await sendWeeklyProgress(userEmail, {
      name: user.name || 'User',
      paths: pathsProgress
    });

    console.log('✅ Email sent successfully');
    res.json({
      message: 'Weekly progress report sent',
      details: {
        pathsChecked: paths.length,
        progress: pathsProgress,
        emailResult: {
          messageId: result.messageId,
          response: result.response
        }
      }
    });
  } catch (error) {
    console.error('❌ Error in weekly progress simulation:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 