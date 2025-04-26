// src/interfaces/cart/cart.interfaces.ts

import { Types, Document } from 'mongoose';

export interface ICart extends Document {
    userId: Types.ObjectId | string;
    products: Types.DocumentArray<CartProductInternal>;
    userEmail?: string;
    createdBy?: "User" | "Admin";
    updatedBy?: "User" | "Admin";
    createdAt?: Date;
    updatedAt?: Date;
}

//restrict admin from changing the user's ICart.


export interface CartProductInput {
    productId: Types.ObjectId | string;
    quantity: number;
}

export interface CartOperationInput {
    products: CartProductInput[];
    userEmail?: string;
}

export interface CartProductInternal extends Types.Subdocument {
    productId: Types.ObjectId;
    quantity: number;
}

export interface ProductDocumentInternal extends Document {
    _id: Types.ObjectId;
    inventory: number;
}

export interface CartDocumentInternal extends ICart, Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    products: Types.DocumentArray<CartProductInternal>;
}

export interface ApiResponse {
    status: number;
    success: boolean;
    message: string | object;
    data?: any;
}

export interface UserResolutionResult {
    userId: Types.ObjectId | null;
    isAdminAction: boolean;
    error?: ApiResponse;
}

export interface InventoryUpdateResult {
    success: boolean;
    errors?: any;
}

export interface CreateCartDto {
  userId: Types.ObjectId | string;
  products: { productId: Types.ObjectId | string; quantity: number }[];
  userEmail?: string;
  createdBy?: "User" | "Admin";
}