// src/validators/userValidator.ts

import { Request, Response, NextFunction } from 'express';
import HttpStatusCodes from '../constants/statusCodes'; 

// Middleware to validate login input (email and password are required)
export const validateAuthInput = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
     res.status(HttpStatusCodes.UNAUTHORIZED).json({status:HttpStatusCodes.UNAUTHORIZED, success:false, message:"Email and password are required field!"});
     return;
  }
  next();
};
