// src/models/Order.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  userId: string;
  items: [{
    productId: string;
    quantity: number;
    status: "Pending" | "Done";
  }];
  userEmail?: string;
  createdBy?: "User" | "Admin";
  updatedBy?: "User" | "Admin";
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true },
    items: [{
      productId: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      status: { type: String, enum: ["Pending", "Done"], default: "Pending", required: true },
    }],
    userEmail: { type: String },
    createdBy: { type: String, enum: ["User", "Admin"], default: "User" },
    updatedBy: { type: String, enum: ["User", "Admin"], default: "User" },
  },
  {
    timestamps: true, 
  }
);

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
