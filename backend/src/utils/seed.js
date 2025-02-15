import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Path from '../models/Path.js';
import { seedUsers, seedTasks, seedPaths } from '../data/seedData.js';
import bcrypt from 'bcryptjs';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected!');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    await Path.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = {
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
      isAdmin: true
    };

    // Hash password and create admin
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    const admin = await User.create({
      ...adminUser,
      password: hashedPassword
    });
    console.log('Created admin user:', admin.email);

    // Hash passwords for other users
    const hashedUsers = await Promise.all(
      seedUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );

    // Create users
    const users = await User.create(hashedUsers);
    console.log('Created users:', users.map(u => u.email).join(', '));

    // Create paths
    const paths = await Path.create(seedPaths);
    console.log('Created paths:', paths.map(p => p.title).join(', '));

    // Create tasks and assign to users
    const tasksWithUsers = seedTasks.map((task, index) => ({
      ...task,
      userId: users[index % users.length]._id
    }));

    const tasks = await Task.create(tasksWithUsers);
    console.log('Created tasks:', tasks.map(t => t.title).join(', '));

    console.log('\nDatabase seeded successfully!');
    console.log('\nAdmin login credentials:');
    console.log('Email:', adminUser.email);
    console.log('Password:', adminUser.password);

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// Run the seed function
seedDatabase(); 