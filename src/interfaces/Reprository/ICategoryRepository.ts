// src/repositories/interfaces/ICategoryRepository.ts

import { Types, Document } from 'mongoose';
import { ICategory } from '../Category/category.interfaces';

export interface ICategoryDocument extends ICategory, Document {}

export interface ICategoryRepository {
    findByName(name: string): Promise<ICategoryDocument | null>;
    create(categoryData: Partial<ICategory>): Promise<ICategoryDocument>;
    findById(id: string): Promise<ICategoryDocument | null>;
}