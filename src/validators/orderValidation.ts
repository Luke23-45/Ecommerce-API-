// src/validation/orderCustomValidation.ts

import { Request, Response, NextFunction } from 'express';
import HttpStatusCodes from '../constants/statusCodes';
import { Types } from 'mongoose';

// Validation for adding items to an order (expects { products: [{ productId, status: "Pending" }] })
export const validateAddItemsToOrder = (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const errors: string[] = [];
    const allowedItemFields = ['productId', 'status']; // Allowed fields for items

    if (!body || typeof body !== 'object' || !Array.isArray(body.products)) {
        errors.push('Request body must be an object containing a "products" array.');
    } else {
        const items = body.products;

        if (items.length === 0) {
            errors.push('"products" array cannot be empty.');
        } else {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (!item || typeof item !== 'object') {
                    errors.push(`Item at products[${i}] is not a valid object.`);
                    continue;
                }

                // Validate productId
                if (!item.productId) {
                    errors.push(`Item at products[${i}] requires a "productId".`);
                } else if (typeof item.productId !== 'string' || !Types.ObjectId.isValid(item.productId)) {
                    errors.push(`Item at products[${i}] has an invalid "productId" format.`);
                }

                // Validate status (assuming "Pending" is expected here)
                if (!item.status) {
                     errors.push(`Item at products[${i}] requires a "status".`);
                } else if (typeof item.status !== 'string' || item.status !== "Pending") {
                     errors.push(`Item at products[${i}] has an invalid "status". Expected "Pending".`);
                }

                const itemKeys = Object.keys(item);
                for (const key of itemKeys) {
                    if (!allowedItemFields.includes(key)) {
                        errors.push(`Item at products[${i}] contains an disallowed field: '${key}'.`);
                    }
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

// Validation for removing items from an order (expects { products: [{ productId }] })
export const validateRemoveItemsFromOrder = (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const errors: string[] = [];
    const allowedItemFields = ['productId']; 

    if (!body || typeof body !== 'object' || !Array.isArray(body.products)) {
        errors.push('Request body must be an object containing a "products" array.');
    } else {
        const items = body.products;

        if (items.length === 0) {
            errors.push('"products" array cannot be empty.');
        } else {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (!item || typeof item !== 'object') {
                    errors.push(`Item at products[${i}] is not a valid object.`);
                    continue;
                }

                // Validate productId
                if (!item.productId) {
                    errors.push(`Item at products[${i}] requires a "productId".`);
                } else if (typeof item.productId !== 'string' || !Types.ObjectId.isValid(item.productId)) {
                    errors.push(`Item at products[${i}] has an invalid "productId" format.`);
                }

                 // Checking for any extra fields not allowed in this item object
                 const itemKeys = Object.keys(item);
                 for (const key of itemKeys) {
                      if (!allowedItemFields.includes(key)) {
                           errors.push(`Item at products[${i}] contains an disallowed field: '${key}'.`);
                      }
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

// Validation for updating items in an order (expects { products: [{ productId, status }] })
export const validateUpdateOrderItems = (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const errors: string[] = [];
    const allowedItemFields = ['productId', 'status']; 

    if (!body || typeof body !== 'object' || !Array.isArray(body.products)) {
        errors.push('Request body must be an object containing a "products" array.');
    } else {
        const items = body.products;

        if (items.length === 0) {
            errors.push('"products" array cannot be empty.');
        } else {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (!item || typeof item !== 'object') {
                    errors.push(`Item at products[${i}] is not a valid object.`);
                    continue;
                }

                // Validate productId
                if (!item.productId) {
                    errors.push(`Item at products[${i}] requires a "productId".`);
                } else if (typeof item.productId !== 'string' || !Types.ObjectId.isValid(item.productId)) {
                    errors.push(`Item at products[${i}] has an invalid "productId" format.`);
                }

                // Validate status ( "Pending", "Done" are valid statuses for update)
                if (!item.status) {
                    errors.push(`Item at products[${i}] requires a "status".`);
                } else if (typeof item.status !== 'string' || (item.status !== "Pending" && item.status !== "Done")) {
                     errors.push(`Item at products[${i}] has an invalid "status". Expected "Pending" or "Done".`);
                }


                // Check for any extra fields not allowed in this item object
                const itemKeys = Object.keys(item);
                for (const key of itemKeys) {
                    if (!allowedItemFields.includes(key)) {
                        errors.push(`Item at products[${i}] contains an disallowed field: '${key}'.`);
                    }
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


