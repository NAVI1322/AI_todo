import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('Initializing email transporter...');

// Verify required environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('Missing email configuration. Please check your .env file for EMAIL_USER and EMAIL_PASSWORD');
  process.exit(1);
}

// Create transporter with more detailed configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  debug: true, // Enable debug logging
  logger: true // Log to console
});

// Verify transporter connection
console.log('Verifying email configuration...');
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Password length:', process.env.EMAIL_PASSWORD?.length || 0);

transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter verification failed:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response
    });
  } else {
    console.log('Email transporter is ready to send emails');
  }
});

export const sendTaskReminder = async (userEmail, data) => {
  console.log('Sending task reminder email to:', userEmail);
  try {
    if (!userEmail) {
      throw new Error('User email is required');
    }
    if (!data || !data.name || !data.paths) {
      throw new Error('Invalid data format for task reminder');
    }

    const mailOptions = {
      from: {
        name: 'AI TODO Learning',
        address: process.env.EMAIL_USER
      },
      to: userEmail,
      subject: '📚 Your Learning Progress Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
            <h2 style="margin: 0;">Hey ${data.name}! 👋</h2>
            <p style="margin-top: 10px; opacity: 0.9;">Here's your personalized learning update</p>
          </div>

          ${data.paths.map(path => `
            <div style="margin-top: 25px; background-color: white; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="padding: 20px; border-bottom: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <h3 style="color: #2d3748; margin: 0;">${path.pathTitle}</h3>
                  <span style="background-color: #ebf4ff; color: #4299e1; padding: 4px 8px; border-radius: 12px; font-size: 14px;">
                    Day ${path.dayNumber}
                  </span>
                </div>
                <p style="color: #4a5568; margin: 10px 0 0 0; font-size: 15px;">${path.dayTitle}</p>
              </div>

              <div style="padding: 20px;">
                <div style="margin-bottom: 15px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <span style="color: #4a5568; font-size: 14px;">Daily Progress</span>
                    <span style="color: #2d3748; font-weight: bold;">${Math.round((path.completedTasks / path.totalTasks) * 100)}%</span>
                  </div>
                  <div style="background-color: #edf2f7; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background-color: #4299e1; width: ${(path.completedTasks / path.totalTasks) * 100}%; height: 100%;"></div>
                  </div>
                </div>

                <div style="background-color: #f7fafc; border-radius: 8px; padding: 15px;">
                  <h4 style="color: #2d3748; margin: 0 0 10px 0;">Pending Tasks</h4>
                  ${path.tasks.map(task => `
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                      <span style="color: #e53e3e; margin-right: 8px;">◯</span>
                      <p style="color: #4a5568; margin: 0; font-size: 14px;">${task.title}</p>
                    </div>
                  `).join('')}
                </div>

                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #718096; font-size: 14px;">Tasks Completed Today</span>
                    <span style="color: #2d3748; font-weight: bold;">${path.completedTasks} of ${path.totalTasks}</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}

          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #4a5568; font-size: 16px; font-weight: bold;">
              ${getMotivationalMessage()}
            </p>
            <a href="#" style="display: inline-block; margin-top: 15px; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
              Continue Learning
            </a>
          </div>
        </div>
      `
    };

    console.log('Attempting to send task reminder email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Task reminder email sent successfully:', {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected
    });
    return info;
  } catch (error) {
    console.error('Error sending task reminder email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      stack: error.stack
    });
    throw error;
  }
};

export const sendWeeklyProgress = async (userEmail, data) => {
  console.log('Sending weekly progress email to:', userEmail);
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '📈 Your Weekly Learning Analytics',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
            <h2 style="margin: 0;">Weekly Learning Report</h2>
            <p style="margin-top: 10px; opacity: 0.9;">Here's your learning journey this week, ${data.name}!</p>
          </div>

          <div style="margin-top: 25px; background-color: white; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px;">
            <h3 style="color: #2d3748; margin: 0 0 20px 0;">Learning Path Progress</h3>
            
            ${data.paths.map(path => `
              <div style="margin-bottom: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <div>
                    <h4 style="color: #2d3748; margin: 0;">${path.pathTitle}</h4>
                    <p style="color: #718096; margin: 5px 0 0 0; font-size: 14px;">
                      ${path.completedDays} of ${path.totalDays} days completed
                    </p>
                  </div>
                  <div style="text-align: right;">
                    <span style="display: block; color: ${getColorForProgress(path.progress)}; font-size: 24px; font-weight: bold;">
                      ${path.progress}%
                    </span>
                    <span style="color: #718096; font-size: 12px;">completion</span>
                  </div>
                </div>

                <div style="background-color: #edf2f7; height: 8px; border-radius: 4px; overflow: hidden;">
                  <div style="background-color: ${getColorForProgress(path.progress)}; width: ${path.progress}%; height: 100%;"></div>
                </div>

                <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                  <div style="flex: 1; text-align: center; padding: 10px; background-color: #f7fafc; border-radius: 8px; margin-right: 10px;">
                    <span style="display: block; color: #2d3748; font-weight: bold;">${path.completedDays}</span>
                    <span style="color: #718096; font-size: 12px;">Days Completed</span>
                  </div>
                  <div style="flex: 1; text-align: center; padding: 10px; background-color: #f7fafc; border-radius: 8px; margin-right: 10px;">
                    <span style="display: block; color: #2d3748; font-weight: bold;">${path.totalDays - path.completedDays}</span>
                    <span style="color: #718096; font-size: 12px;">Days Remaining</span>
                  </div>
                  <div style="flex: 1; text-align: center; padding: 10px; background-color: #f7fafc; border-radius: 8px;">
                    <span style="display: block; color: #2d3748; font-weight: bold;">${Math.round(path.completedDays / path.totalDays * 100)}%</span>
                    <span style="color: #718096; font-size: 12px;">Completion Rate</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="margin-top: 25px; background-color: white; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0;">Weekly Insights</h3>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
              <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; text-align: center;">
                <span style="display: block; color: #4299e1; font-size: 24px; font-weight: bold;">
                  ${data.paths.reduce((acc, path) => acc + path.completedDays, 0)}
                </span>
                <span style="color: #718096; font-size: 14px;">Total Days Completed</span>
              </div>
              <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; text-align: center;">
                <span style="display: block; color: #48bb78; font-size: 24px; font-weight: bold;">
                  ${Math.round(data.paths.reduce((acc, path) => acc + path.progress, 0) / data.paths.length)}%
                </span>
                <span style="color: #718096; font-size: 14px;">Average Progress</span>
              </div>
            </div>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #4a5568; font-size: 16px; font-weight: bold;">
              ${getWeeklyMotivationalMessage()}
            </p>
            <a href="#" style="display: inline-block; margin-top: 15px; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
              View Detailed Analytics
            </a>
          </div>
        </div>
      `
    };

    console.log('Attempting to send weekly progress email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Weekly progress email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending weekly progress email:', error);
    throw error;
  }
};

function getMotivationalMessage() {
  const messages = [
    "Keep pushing forward! Every task completed is progress made! 💪",
    "Small steps lead to big achievements! You're doing great! 🌟",
    "Stay focused and keep up the momentum! You've got this! 🚀",
    "Your dedication to learning is inspiring! Keep going! ✨",
    "Progress happens one task at a time. You're on the right track! 🎯"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function getWeeklyMotivationalMessage() {
  const messages = [
    "What an incredible week of learning! Keep that momentum going! 🌱",
    "Your consistency is paying off! Another week of growth! 💫",
    "You're building something amazing, one week at a time! 🎯",
    "Keep embracing the journey of learning! You're doing fantastic! 🚀",
    "Every week brings new opportunities to learn and grow! Keep shining! ✨"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function getColorForProgress(progress) {
  if (progress >= 80) return '#48bb78'; // green
  if (progress >= 60) return '#4299e1'; // blue
  if (progress >= 40) return '#ecc94b'; // yellow
  if (progress >= 20) return '#ed8936'; // orange
  return '#f56565'; // red
} 