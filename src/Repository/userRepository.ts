// src/repositories/UserRepository.ts

import UserModel from '../models/User'; 
import { IUserRepository, IUserDocument } from '../interfaces/Reprository/IUserRepository';
import { IUser } from '../interfaces/User/IUser';
import { Types } from 'mongoose';
// src/repositories/UserRepository.ts

export class UserRepository implements IUserRepository {
    async findById(id: string): Promise<IUserDocument | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return await UserModel.findById(id);
    }

    async findByEmail(email: string): Promise<IUserDocument | null> {
        return await UserModel.findOne({ email });
    }

    async existsByEmail(email: string): Promise<boolean> {
        const result = await UserModel.exists({ email });
        return !!result;
    }

    async create(userData: Partial<IUser>): Promise<IUserDocument> {
        const newUser = new UserModel(userData);
        await newUser.save();
        return newUser;
    }

    async findByEmailWithPassword(email: string): Promise<IUserDocument | null> {
        const user = await UserModel.findOne({ email }).select('+password');
        return user;
    }

    async update(id: string, updateData: Partial<IUser>): Promise<IUserDocument | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return await UserModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(id)) {
            return false;
        }
        const result = await UserModel.findByIdAndDelete(id);
        return !!result;
    }

    async findAll(): Promise<IUserDocument[]> {
        return await UserModel.find();
    }

}