// src/middleware/validation/productCustomValidation.ts

import { Request, Response, NextFunction } from 'express';
import HttpStatusCodes from '../constants/statusCodes';
import { Types } from 'mongoose';

export const validateProductCreation = (req: Request, res: Response, next: NextFunction) => {
    const { name, price, description, category, inventory } = req.body;
    const errors: string[] = [];

    // Validate 'name'
    if (!name || typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 100) {
        errors.push('Product name is required and must be between 3 and 100 characters.');
    }

    // Validate 'price'
    if (price === undefined || typeof price !== 'number' || price <= 0) {
        errors.push('Price is required and must be a positive number.');
    }

    // Validate 'description'
    if (description !== undefined && description !== null && (typeof description !== 'string' || description.length > 500)) {
         errors.push('Description cannot exceed 500 characters.');
    }


    // Validate 'category'
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
        errors.push('Category is required and must be a non-empty string.');
    }


    // Validate 'inventory'
    if (inventory === undefined || typeof inventory !== 'number' || !Number.isInteger(inventory) || inventory < 0) {
        errors.push('Inventory is required and must be a non-negative integer.');
    }

    if (errors.length > 0) {
         res.status(HttpStatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Validation failed.',
            errors: errors,
        });
        return;
    }
    next();
};


export const validateProductIdParam = (req: Request, res: Response, next: NextFunction) => {
  const productId = req.params.id; 

  if (!productId) {
       res.status(HttpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Product ID is required in the URL parameters.',
      });
      return;
  }

  // Check if the provided ID is a valid Mongoose ObjectId format
  if (!Types.ObjectId.isValid(productId)) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
           success: false,
           message: 'Invalid Product ID format.',
       });
       return;
  }
  next(); 
};


export const validateProductUpdate = (req: Request, res: Response, next: NextFunction) => {
  const updateData = req.body;
  const errors: string[] = [];
  const allowedFields = ['name', 'price', 'description', 'category', 'inventory']; 

  const hasFieldsToUpdate = allowedFields.some(field => updateData.hasOwnProperty(field));

  if (!hasFieldsToUpdate) {
       errors.push('Request body must contain at least one valid field to update.');
  }
  // Validate 'name' if present
  if (updateData.name !== undefined && (typeof updateData.name !== 'string' || updateData.name.trim().length < 3 || updateData.name.trim().length > 100)) {
      errors.push('Product name must be between 3 and 100 characters if provided.');
  }

  // Validate 'price' if present
  if (updateData.price !== undefined && (typeof updateData.price !== 'number' || updateData.price <= 0)) {
      errors.push('Price must be a positive number if provided.');
  }

  // Validate 'description' if present
   if (updateData.description !== undefined && (updateData.description !== null && (typeof updateData.description !== 'string' || updateData.description.length > 500))) {
        errors.push('Description cannot exceed 500 characters if provided.');
   }

  // Validate 'category' if present
  if (updateData.category !== undefined && (typeof updateData.category !== 'string' || updateData.category.trim().length === 0)) {
      errors.push('Category must be a non-empty string if provided.');
  }

  // Validate 'inventory' if present
  if (updateData.inventory !== undefined && (typeof updateData.inventory !== 'number' || !Number.isInteger(updateData.inventory) || updateData.inventory < 0)) {
      errors.push('Inventory must be a non-negative integer if provided.');
  }

  // Check for any extra fields not allowed
   for (const field in updateData) {
        if (updateData.hasOwnProperty(field) && !allowedFields.includes(field)) {
             errors.push(`Field '${field}' is not allowed for update.`);
        }
   }

  if (errors.length > 0) {
       res.status(HttpStatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed.',
          errors: errors,
      });
      return;
  }

  next();
};
