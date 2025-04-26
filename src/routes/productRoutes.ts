// src/routes/productRoutes.ts
import express from 'express';
import { ProductController } from '../controllers/productController';
import { authMiddleware,hasPermission } from './../middlewares/authMiddleware';
import { validateProductCreation, validateProductIdParam,validateProductUpdate } from '../validators/productValidation';


export const productRoutes = (productController:ProductController) =>{
  const router = express.Router();

  // Route to create a new product (requires authentication and 'create:products' permission)
  router.post(
    '/',
    authMiddleware,
    validateProductCreation,
    (req, res, next) => hasPermission(req, res, next, "product:create"),
    (req, res) => productController.createProduct(req as any, res)
  );
  
  // // Route to get all products (requires authentication and 'read:products' permission)
  router.get(
    '/getall',
    // authMiddleware,
    // (req, res, next) => hasPermission(req, res, next, "product:view"),
    (req, res) => productController.getAllProducts(req as any, res)
  );
  router.post(
    '/getforUser',
    authMiddleware,
    (req, res, next) => hasPermission(req, res, next, "product:view"),
    (req, res) =>productController.getAllProductsForUser(req as any, res)
  );
  
  // // Route to get a product by ID (requires authentication and 'read:products' permission)
  router.get(
    '/getproduct/:id',
    validateProductIdParam,
    (req, res) => productController.getProductById(req as any, res)
  );
  
  // // Route to update a product by ID (requires authentication and 'update:products' permission)
  router.put(
    '/updateproduct/:id',
    authMiddleware,
    validateProductIdParam,
    validateProductUpdate,
    (req, res, next) => hasPermission(req, res, next, "product:update"),
    (req, res) => productController.updateProduct(req as any, res)
  );
  
  // // Route to delete a product by ID (requires authentication and 'delete:products' permission)
  router.delete(
    '/deleteproduct/:id',
    authMiddleware,
    validateProductIdParam,
    (req, res, next) => hasPermission(req, res, next, "product:delete"),
    (req, res) => productController.deleteProduct(req as any, res)
  );
  return router
}


