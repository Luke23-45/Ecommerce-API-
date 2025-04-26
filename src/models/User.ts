// src/models/User.ts
import mongoose, { Schema, Document, model } from 'mongoose';

import { IUser } from '../interfaces/User/IUser';

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    permissions: {
      type: [String],
      default: []
    },
    refreshToken: {
      type: String
    }
  },
  {
    timestamps: true  
  }
);

// Create & export the User model
const User = model<IUser>('User', UserSchema);
export default User;
