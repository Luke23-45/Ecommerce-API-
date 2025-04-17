// src/server.ts
import express, { Express, Request, Response } from 'express';
import connectDB from './config/database';


const app: Express = express();
const port = require('./config/config').default.port; 

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json()); // To parse JSON request bodies



app.get('/', (req: Request, res: Response) => {
  res.send('Ecommerce API is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});