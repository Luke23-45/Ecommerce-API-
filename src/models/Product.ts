// src/models/Product.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from '../interfaces/Product/IProduct';

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    inventory: { type: Number, required: true, min: 0, default: 0 },
    userId:{type: String, required: true, trim: true},
    image: { type: String, trim: true },
    userEmail:{type:String, trim:true, required:false,default:""},
    createdBy:{type:String,default:"User", trim:true, required:false},
    updatedBy:{type:String, trim:true, default:"User",required:false}
  },
  {
    timestamps: true, 
  }
);

const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
