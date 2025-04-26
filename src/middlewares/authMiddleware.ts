// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from './../config/config';


declare global {
  namespace Express {
    interface Request {
      userId?: string;
      isAdmin?: boolean;
      permissions?: string[];
    }
  }
}

interface DecodedToken {
  userId: string;
  isAdmin?: boolean;
  permissions?: string[];
  iat?: number;
  exp?: number;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Missing or malformed authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as DecodedToken;
    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin;
    req.permissions = decoded.permissions;
    return next();
  } catch (err: any) {
    console.error('JWT verification failed:', err);
    return res
      .status(401)
      .json({ message: 'Invalid or expired token', error: err.message });
  }
};



export const hasPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
  requiredPermission: string
): Promise<any> => {
  try {
    console.log('Checking permission:', requiredPermission);
    console.log('User permissions:', req.permissions);
    console.log('Is Admin:', req.isAdmin);

    // Check if the user has the specific required permission
    if (req.permissions && Array.isArray(req.permissions) && req.permissions.includes(requiredPermission)) {
      console.log(`Permission '${requiredPermission}' granted.`);
      return next();
    }
    // Permission denied
    console.log(`Permission '${requiredPermission}' denied.`);
    return res.status(403).json({ message: 'Permission denied.' });

  } catch (error) {
    console.error('Error checking permission:', error);
    return res.status(500).json({ message: 'Failed to check permissions.' });
  }
};