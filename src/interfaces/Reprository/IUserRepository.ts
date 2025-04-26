// src/repositories/interfaces/IUserRepository.ts

import { IUser } from '../User/IUser';
import { Document } from 'mongoose';


export interface IUserDocument extends IUser, Document {}

export interface IUserRepository {
    findById(id: string): Promise<IUserDocument | null>;
    findByEmail(email: string): Promise<IUserDocument | null>;
    existsByEmail(email: string): Promise<boolean>;
    create(userData: Partial<IUser>): Promise<IUserDocument>;
    findByEmailWithPassword(email: string): Promise<IUserDocument | null>;
    update(id: string, updateData: Partial<IUser>): Promise<IUserDocument | null>;
    delete(id: string): Promise<boolean>;
    findAll(): Promise<IUserDocument[]>;
}