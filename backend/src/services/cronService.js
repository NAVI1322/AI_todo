import cron from 'node-cron';
import User from '../models/User.js';
import Path from '../models/Path.js';
import { UserPreference } from '../models/UserPreference.js';
import { sendTaskReminder, sendWeeklyProgress } from '../utils/mailer.js';

// Function to check for incomplete tasks and send reminders
const checkIncompleteTasks = async () => {
  try {
    // Get all users with their preferences
    const usersWithPrefs = await User.aggregate([
      {
        $lookup: {
          from: 'userpreferences',
          localField: '_id',
          foreignField: 'userId',
          as: 'preferences'
        }
      },
      {
        $match: {
          'preferences.settings.emailNotifications': true
        }
      }
    ]);

    for (const user of usersWithPrefs) {
      const paths = await Path.find({ user: user._id });
      const pathsWithMissedDays = [];
      
      for (const path of paths) {
        // Get all days with incomplete tasks
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

        // Check for consecutive missed days
        let consecutiveMissedDays = 0;
        let currentIndex = incompleteDays.length - 1;

        while (currentIndex >= 0) {
          if (incompleteDays[currentIndex]) {
            consecutiveMissedDays++;
          } else {
            break;
          }
          currentIndex--;
        }

        // If user has missed 2 or more consecutive days, add to notification list
        if (consecutiveMissedDays >= 2) {
          pathsWithMissedDays.push({
            pathTitle: path.title,
            dayNumber: incompleteDays[incompleteDays.length - 1].dayNumber,
            dayTitle: incompleteDays[incompleteDays.length - 1].dayTitle,
            tasks: incompleteDays[incompleteDays.length - 1].tasks,
            totalTasks: incompleteDays[incompleteDays.length - 1].totalTasks,
            completedTasks: incompleteDays[incompleteDays.length - 1].completedTasks,
            missedDays: consecutiveMissedDays
          });
        }
      }

      // Send notification if there are missed days
      if (pathsWithMissedDays.length > 0) {
        await sendTaskReminder(user.email, {
          name: user.name,
          paths: pathsWithMissedDays
        });
      }
    }
  } catch (error) {
    console.error('Error in checkIncompleteTasks:', error);
  }
};

// Function to send weekly progress reports
const sendWeeklyReports = async () => {
  try {
    // Get all users with their preferences who have weekly digest enabled
    const usersWithPrefs = await User.aggregate([
      {
        $lookup: {
          from: 'userpreferences',
          localField: '_id',
          foreignField: 'userId',
          as: 'preferences'
        }
      },
      {
        $match: {
          'preferences.settings.weeklyDigest': true
        }
      }
    ]);

    for (const user of usersWithPrefs) {
      const paths = await Path.find({ user: user._id });
      
      // Calculate progress for each path
      const pathsProgress = paths.map(path => {
        const totalDays = path.days.length;
        const completedDays = path.days.filter(day => 
          day.tasks.every(task => task.completed)
        ).length;

        return {
          pathTitle: path.title,
          completedDays,
          totalDays,
          progress: Math.round((completedDays / totalDays) * 100)
        };
      });

      // Send weekly progress report
      if (pathsProgress.length > 0) {
        await sendWeeklyProgress(user.email, {
          name: user.name,
          paths: pathsProgress
        });
      }
    }
  } catch (error) {
    console.error('Error in sendWeeklyReports:', error);
  }
};

// Schedule tasks
// Check for incomplete tasks daily at 9 PM
cron.schedule('0 21 * * *', checkIncompleteTasks);

// Send weekly reports every Monday at 10 AM
cron.schedule('0 10 * * 1', sendWeeklyReports);

export { checkIncompleteTasks, sendWeeklyReports }; 