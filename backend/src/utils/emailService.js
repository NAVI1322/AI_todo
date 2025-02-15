import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendOverdueNotification = async (userEmail, taskTitle, overdueSteps) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Reminder: You have overdue tasks',
    html: `
      <h1>Reminder</h1>
      <p>You have overdue steps in your learning path: ${taskTitle}</p>
      <ul>
        ${overdueSteps.map(step => `<li>${step.description}</li>`).join('')}
      </ul>
    `
  });
};

export const sendWeeklyDigest = async (userEmail, pathProgress) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Your Weekly Learning Progress',
    html: `
      <h1>Weekly Progress Report</h1>
      <div>
        ${pathProgress.map(path => `
          <div style="margin-bottom: 20px;">
            <h2>${path.title}</h2>
            <p>Progress: ${path.progress}%</p>
            <p>Completed Steps: ${path.completedSteps}/${path.totalSteps}</p>
          </div>
        `).join('')}
      </div>
      <p>Keep up the great work!</p>
    `
  });
}; 