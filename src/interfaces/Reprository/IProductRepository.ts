// src/interfaces/IProductRepository.ts

import { IProduct } from '../Product/IProduct';
import { Document } from 'mongoose';
import { FilterQuery,Types } from 'mongoose';

export interface IProductDocument extends IProduct, Document {}

export interface IProductRepository {
    find(query?: FilterQuery<IProduct>, projection?: any): Promise<IProductDocument[]>;
    findById(id: string): Promise<IProductDocument | null>;
    create(productData: Partial<IProduct>): Promise<IProductDocument>;
    update(id: string, updateData: Partial<IProduct>): Promise<IProductDocument | null>;
    delete(id: string): Promise<boolean>;
    //for the cart
    findProductsByIds(ids: Types.ObjectId[], projection?: any): Promise<IProductDocument[]>;
    bulkWrite(bulkOps: any[]): Promise<any>;
}