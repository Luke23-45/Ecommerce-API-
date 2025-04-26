// src/config/config.ts
import dotenv from 'dotenv';
dotenv.config();

interface Config {
  port: number;
  mongoURI: string;
  jwtSecret: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || '8000', 10),
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/product_management/', 
  jwtSecret: process.env.JWT_SECRET || 'secret-key',
};

export default config;