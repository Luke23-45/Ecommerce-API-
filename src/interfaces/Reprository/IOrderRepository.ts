// src/repositories/interfaces/IOrderRepository.ts

import { Types, Document } from 'mongoose';
import { IOrder } from '../Order/order.interfaces';


export interface IOrderDocument extends IOrder, Document {}

export interface IOrderRepository {
    findOneByUserId(userId: Types.ObjectId | string): Promise<IOrderDocument | null>;
    create(orderData: Partial<IOrder>): Promise<IOrderDocument>;
    findByIdAndUpdate(id: Types.ObjectId | string, update: any, options?: any): Promise<IOrderDocument | null>;
    findProductItemInOrderUsingAggregation(modelName:string, userId: Types.ObjectId | string, targetProductId: string): Promise<any | undefined>; 
}