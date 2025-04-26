// src/models/Cart.ts
import mongoose, { Schema, Document, Types } from 'mongoose';
import { ICart } from '../interfaces/Cart/cart.interfaces';

const CartSchema = new Schema<ICart>(
  {
    userId: { type: String, required: true },
    products: [{
      productId: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
    }],
    userEmail: { type: String },
    createdBy: { type: String, enum: ["User", "Admin"], default: "User" },
    updatedBy: { type: String, enum: ["User", "Admin"], default: "User" },
  },
  {
    timestamps: true, 
  }
);

const Cart = mongoose.model<ICart>('Cart', CartSchema);

export default Cart;