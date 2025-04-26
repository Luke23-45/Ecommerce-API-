// src/repositories/interfaces/ICartRepository.ts

import { ICart, CartDocumentInternal,CreateCartDto } from '../Cart/cart.interfaces'; 
import { Document, Types } from 'mongoose';

export interface ICartDocument extends ICart, Document {} 

export interface ICartRepository {
    findByUserId(userId: Types.ObjectId | string): Promise<CartDocumentInternal | null>; 
    create(cartData: Partial<CreateCartDto>): Promise<CartDocumentInternal>;
    save(cart: CartDocumentInternal): Promise<CartDocumentInternal>;
    deleteOneByUserId(userId: Types.ObjectId | string): Promise<{ deletedCount?: number }>; 
}