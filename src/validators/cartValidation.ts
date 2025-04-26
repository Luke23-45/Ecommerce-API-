// src/validation/cartCustomValidation.ts

import { Request, Response, NextFunction } from 'express';
import HttpStatusCodes from '../constants/statusCodes';
import { Types } from 'mongoose';

// Validation for adding or updating items (expects an array of { productId, quantity })
export const validateAddOrUpdateCartItems = (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const errors: string[] = [];
    const allowedFields = ['productId', 'quantity'];
    if (!body || typeof body !== 'object' || !Array.isArray(body.products)) {
      errors.push('Request body must be an object containing a "products" array.');
    } else {
      const items = body.products;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item || typeof item !== 'object') {
                errors.push(`Item at index ${i} is not a valid object.`);
                continue;
            }
            // Validate productId
            if (!item.productId) {
                errors.push(`Item at index ${i} requires a productId.`);
            } else if (typeof item.productId !== 'string' || !Types.ObjectId.isValid(item.productId)) {
                 errors.push(`Item at index ${i} has an invalid productId format.`);
            }

            // Validate quantity (must be a positive integer for add/update)
            if (item.quantity === undefined) {
                 errors.push(`Item at index ${i} requires a quantity.`);
            } else if (typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity <= 0) {
                errors.push(`Item at index ${i} requires a positive integer quantity.`);
            }

             // Check for any extra fields not allowed in this item object
             const itemKeys = Object.keys(item);
             for (const key of itemKeys) {
                  if (!allowedFields.includes(key)) {
                       errors.push(`Item at index ${i} contains an disallowed field: '${key}'.`);
                  }
             }
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

// Validation for removing items (expects an array of { productId })
export const validateRemoveCartItems = (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;

    const errors: string[] = [];

    const allowedFields = ['productId']; // Define allowed fields for removal

    if (!body || typeof body !== 'object' || !Array.isArray(body.products)) {
      errors.push('Request body must be an object containing a "products" array.');
    } else {
      const items = body.products;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
             if (!item || typeof item !== 'object') {
                 errors.push(`Item at index ${i} is not a valid object.`);
                 continue;
             }

            // Validate productId
            if (!item.productId) {
                errors.push(`Item at index ${i} requires a productId.`);
            } else if (typeof item.productId !== 'string' || !Types.ObjectId.isValid(item.productId)) {
                 errors.push(`Item at index ${i} has an invalid productId format.`);
            }
             // Check for any extra fields not allowed in this item object
              const itemKeys = Object.keys(item);
              for (const key of itemKeys) {
                   if (!allowedFields.includes(key)) {
                        errors.push(`Item at index ${i} contains an disallowed field: '${key}'.`);
                   }
              }
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