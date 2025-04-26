// src/repositories/ProductRepository.ts

import ProductModel from '../models/Product'; // Assuming Mongoose Product model is defined here
import { IProductRepository, IProductDocument } from '../interfaces/Reprository/IProductRepository';
import { IProduct } from '../interfaces/Product/IProduct';
import { Types, FilterQuery } from 'mongoose';

export class ProductRepository implements IProductRepository {
    async find(query: FilterQuery<IProduct> = {}, projection?: any): Promise<IProductDocument[]> {
        return await ProductModel.find(query, projection);
    }
    async findById(id: string): Promise<IProductDocument | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return await ProductModel.findById(id);
    }

    async create(productData: Partial<IProduct>): Promise<IProductDocument> {
        const newProduct = new ProductModel(productData);
        await newProduct.save();
        return newProduct;
    }

    async update(id: string, updateData: Partial<IProduct>): Promise<IProductDocument | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return await ProductModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(id)) {
            return false;
        }
        const result = await ProductModel.findByIdAndDelete(id);
        return !!result;
    }
    async findProductsByIds(ids: Types.ObjectId[], projection?: any): Promise<IProductDocument[]> {
      const validIds = ids.filter(id => Types.ObjectId.isValid(id));
      if (validIds.length === 0 && ids.length > 0) {
          return [];
      }
      const products = await ProductModel.find({ _id: { $in: validIds.length > 0 ? validIds : ids } }).select(projection) as IProductDocument[];
      return products;
 }
 async bulkWrite(bulkOps: any[]): Promise<any> {
     const result = await ProductModel.bulkWrite(bulkOps);
     return result;
 }
}