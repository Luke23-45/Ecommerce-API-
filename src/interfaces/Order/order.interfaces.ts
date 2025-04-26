// src/interfaces/order/order.interfaces.ts

import { Types, Document } from 'mongoose';
import { CartProductInput } from '../Cart/cart.interfaces'; 

export interface IOrder extends Document {
    userId: Types.ObjectId | string;
    items: Types.DocumentArray<OrderItemInternal>;
    userEmail?: string;
    createdBy?: "User" | "Admin";
    updatedBy?: "User" | "Admin";
    createdAt?: Date;
    updatedAt?: Date;
    status: "Pending" | "Done"; //| "Shipped" | "Delivered" | "Cancelled"
}
//restrict admin from changing the user's IOrder.
export interface OrderItemInternal extends Types.Subdocument {
    productId: Types.ObjectId;
    quantity: number;
    status: "Pending" | "Done"; 
}

export interface Item {
    productId: string;
    quantity: number;
    status: "Pending" | "Done";
    _id?: {
        $oid: string;
    };
    [key: string]: any;
}


interface CartProduct {
    productId: Types.ObjectId;
    quantity: number;
}

interface ProductDocument { 
    _id: Types.ObjectId;
    inventory: number;
}

interface CartDocument { 
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    products: Types.DocumentArray<CartProduct>;
    createdBy: string;
}




interface InventoryUpdateResultOrder { 
    success: boolean;
    errors?: any;
}
export interface UserInfo {
  userId: Types.ObjectId | string;
  isAdmin: boolean;
  userEmail?: string;
  permissions?:any[];
}
export interface OrderServiceApiResponse {
    status: number;
    success: boolean;
    message?: string | object;
    data?: any;
}