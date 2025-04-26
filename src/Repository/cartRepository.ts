// src/repositories/CartRepository.ts

import CartModel from '../models/Cart';
import { CartDocumentInternal, ICart,CreateCartDto } from '../interfaces/Cart/cart.interfaces';
import { ICartRepository } from '../interfaces/Reprository/ICartRepository';
import { Types } from 'mongoose';

export class CartRepository implements ICartRepository {
    async findByUserId(userId: Types.ObjectId | string): Promise<CartDocumentInternal | null> {
        return await CartModel.findOne({ userId: userId as Types.ObjectId }).exec() as CartDocumentInternal | null;
    }

    async create(cartData: Partial<CreateCartDto>): Promise<CartDocumentInternal> {
        const newCart = new CartModel(cartData);
        const savedCart = await newCart.save();
        return savedCart as CartDocumentInternal;
    }

    async save(cart: CartDocumentInternal): Promise<CartDocumentInternal> {
        const savedCart = await cart.save();
        return savedCart as CartDocumentInternal;
    }

    async deleteOneByUserId(userId: Types.ObjectId | string): Promise<{ deletedCount?: number }> {
        const result = await CartModel.deleteOne({ userId: userId as Types.ObjectId });
        return { deletedCount: result.deletedCount };
    }
}