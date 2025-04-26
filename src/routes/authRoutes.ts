// src/routes/authRoutes.ts
import express, { RequestHandler } from 'express';
 import {AuthController} from '../controllers/authController';
import { validateAuthInput } from '../validators/userValidator';

export const authRoutes = (authController:AuthController) =>{
  const router = express.Router();
  // Route for user registration
  router.post('/register', validateAuthInput,(req, res) => authController.register(req as any, res));
  // Route for user login
  router.post('/login', validateAuthInput, (req, res) => authController.login(req as any, res));
  return router;
}

