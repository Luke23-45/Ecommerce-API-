// src/controllers/authController.ts
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/Services/ApiResponse.type';
import { AuthService } from '../services/authService';
import { AuthRequestBody } from '../interfaces/User/user.dto';
import HttpStatusCodes from '../constants/statusCodes';

export class AuthController {
  private authService:AuthService;
  constructor(authService:AuthService){
    this.authService = authService;
  }
  async register(req: Request<{}, {}, AuthRequestBody>, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Please provide both email and password.' });
        return;
      }
      const info: ApiResponse = await this.authService.register(email, password);
      res.status(info.status).json(info);
      return;
    } catch (error: any) {
      console.error('Error during registration in controller:', error.message);
      if (error.message.includes('already exists')) {
        res.status(HttpStatusCodes.CONFLICT).json({ message: error.message });
      } else {
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Registration failed. Please try again later.' });
      }
      return;
    }
  }
  async login(req: Request<{}, {}, AuthRequestBody>, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Please provide both email and password.' });
        return;
      }
      const loginResponse: ApiResponse = await this.authService.login(email, password);
      res.status(loginResponse.status).json(loginResponse);
      return;
    } catch (error: any) {
      console.error('Error during login in controller:', error.message);
      res.status(HttpStatusCodes.UNAUTHORIZED).json({ message: error.message });
      return;
    }
  }
}

