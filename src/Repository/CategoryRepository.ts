// src/repositories/CategoryRepository.ts

import CategoryModel from '../models/Category';
import { ICategoryRepository, ICategoryDocument } from '../interfaces/Reprository/ICategoryRepository';
import { ICategory } from '../interfaces/Category/category.interfaces';
import { Types } from 'mongoose';

export class CategoryRepository implements ICategoryRepository {
    async findByName(name: string): Promise<ICategoryDocument | null> {
        return await CategoryModel.findOne({ name: name }).exec();
    }

    async create(categoryData: Partial<ICategory>): Promise<ICategoryDocument> {
        const newCategory = new CategoryModel(categoryData);
        const savedCategory = await newCategory.save();
        return savedCategory;
    }

    async findById(id: string): Promise<ICategoryDocument | null> {
         if (!Types.ObjectId.isValid(id)) {
             return null;
         }
         return await CategoryModel.findById(id).exec();
    }
}