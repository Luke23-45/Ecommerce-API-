import { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  isAdmin: boolean;
  permissions: string[];
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}