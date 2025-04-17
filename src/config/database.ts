// src/config/database.ts
import mongoose from 'mongoose';
import config from './config'; 

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoURI, {
    });
    console.log('MongoDB connected successfully!');
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit process on connection failure
  }
};

export default connectDB;