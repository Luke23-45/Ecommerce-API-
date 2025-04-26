// src/controllers/productController.ts
import { Request, Response } from 'express';
import { IProduct } from '../interfaces/Product/IProduct';
import HttpStatusCodes from '../constants/statusCodes';
import { ProductService } from '../services/productService';
import { ApiResponse } from '../interfaces/Services/ApiResponse.type';
export class ProductController {
  private productService:ProductService;
  constructor(productService:ProductService){
    this.productService = productService;
  }
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      let productData: IProduct = req.body;
      productData["userId"] = req.userId || "";
      const info:ApiResponse = await this.productService.createProduct(productData,{isAdmin:req.isAdmin, permissions:req.permissions});
      res.status(info.status).json(info);
    } catch (error: any) {
      console.error('Error creating product:', error.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(  {status:HttpStatusCodes.INTERNAL_SERVER_ERROR, success:false, message: 'Failed to create product due to a server error.'})
    }
  }

  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const info:ApiResponse = await this.productService.getAllProducts();
      res.status(info.status).json(info);
    } catch (error: any) {
      console.error('Error getting all products:', error.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(  {status:HttpStatusCodes.INTERNAL_SERVER_ERROR, success:false, message: 'Failed to retrieve products.'  })
    }
  }

  async getAllProductsForUser(req: Request, res: Response): Promise<void> {
    try {
      let userEmail: String = req.body.userEmail || "";
      const info:ApiResponse = await this.productService.getAllProductsForUser({userEmail:userEmail,userId:req.userId || "", isAdmin:req.isAdmin, permissions:req.permissions});
      res.status(info.status).json(info);
    } catch (error: any) {
      console.error('Error getting products:', error.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({status:HttpStatusCodes.INTERNAL_SERVER_ERROR, success:false, message: 'Failed to retrieve products.' })
    }
  }
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const productId = req.params.id;
      const info:ApiResponse = await this.productService.getProductById(productId);
      res.status(info.status).json(info);
    } catch (error: any) {
      console.error('Error getting product by ID:', error.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(  {status:HttpStatusCodes.INTERNAL_SERVER_ERROR, success:false, message: 'Failed to retrieve products.'  })
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const productId = req.params.id;
      const updateData: Partial<IProduct> = req.body;
      const info:ApiResponse = await this.productService.updateProduct(productId, updateData,{userId:req.userId || "", isAdmin:req.isAdmin});
      res.status(info.status).json(info);
    } catch (error: any) {
      console.error('Error updating product:', error.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(  {status:HttpStatusCodes.INTERNAL_SERVER_ERROR, success:false, message: 'Failed to update product.'  })
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const productId = req.params.id;
      const success :ApiResponse = await this.productService.deleteProduct(productId,{userId:req.userId || "", isAdmin:req.isAdmin});
      res.status(success.status).json(success);
    } catch (error: any) {
      console.error('Error deleting product:', error.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json(  {status:HttpStatusCodes.INTERNAL_SERVER_ERROR, success:false, message: 'Failed to delete product.'  })
    }
  }
}
