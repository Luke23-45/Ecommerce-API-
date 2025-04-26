// All User-related DTOs in one file
import { Types } from 'mongoose';

export interface AuthRequestBody {
  email?: string;
  password?: string;
}

export interface UserInfo {
    userId: Types.ObjectId | string;
    isAdmin: boolean;
    userEmail?: string;
}