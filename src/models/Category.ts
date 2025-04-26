// src/models/Category.ts

import { Schema, model } from 'mongoose';
import { ICategory } from '../interfaces/Category/category.interfaces';


const categorySchema = new Schema<ICategory>({
    name: { type: String, required: true, unique: true, trim: true },
}, { timestamps: true });


const Category = model<ICategory>('Category', categorySchema);

export default Category;

