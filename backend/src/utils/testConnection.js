import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB Atlas!');
    
    // Test database operations
    const collections = await mongoose.connection.db.collections();
    console.log('Available collections:', collections.map(c => c.collectionName));
    
    await mongoose.connection.close();
    console.log('Connection closed successfully');
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection(); 