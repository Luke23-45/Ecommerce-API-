// src/server.ts

import express, { Express, Request, Response, NextFunction } from 'express'; 
import { connectDB, disconnectDB } from './config/database'; 
import cookieParser from 'cookie-parser';
import config from './config/config';
import { configureApp } from './compositionRoot';

const app: Express = express();
const port = config.port; 


app.use(express.json()); 
app.use(cookieParser()); 



// Database Connection 

connectDB()
    .then(() => {
        console.log('Database connected successfully');

        //  Calling the Composition Root to configure the app 
        // This is where all dependencies are wired and routes are mounted onto 'app'
        configureApp(app);

        //  Global Error Handling Middleware 
        app.use((err: any, req: Request, res: Response, next: NextFunction) => {
             console.error('Unhandled error:', err); 
             const status = err.status || 500; // 
             const message = err.message || 'An unexpected server error occurred.';
             res.status(status).json({ success: false, message: message });
        });


        //  Start the Server 
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
            console.log("MongoDB URI being used:", config.mongoURI);
        });

    })
    .catch((err: any) => { 
        console.error('Database connection error:', err);
        disconnectDB();
        process.exit(1);
    });