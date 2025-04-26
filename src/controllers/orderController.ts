import { Request, Response } from 'express';
import { OrderService } from '../services/orderService';
import HttpStatusCodes from '../constants/statusCodes';
import { ApiResponse } from '../interfaces/Services/ApiResponse.type';


export class OrderController {
  private orderService:OrderService;
  constructor(orderService:OrderService){
    this.orderService = orderService;
  }
  async addItemToOrder(req: Request, res: Response): Promise<void> {
  try {
        let cartData = req.body;
        const info:ApiResponse = await this.orderService.addItemToOrder(cartData,{userId:req.userId as string,isAdmin:req.isAdmin as boolean, permissions:req.permissions,userEmail:req.body.userEmail});
        res.status(info.status).json(info);
      } catch (error: any) {
        console.error('Error creating product:', error.message);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to create product.' });
      }
  }
  async getOrder_(req: Request, res: Response): Promise<void> {
    try {
      const userEmail = req.body.userEmail ?? ""
      const result:ApiResponse = await this.orderService.getOrder({userId:req.userId as string ,isAdmin:req.isAdmin as boolean, userEmail:userEmail});
      res.status(result.status).json(result);
    } catch (error: any) {
      console.error('Error getting user cart:', error.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal Server Error' });
    }
  }
  async deleteOrder_(req: Request, res: Response): Promise<void> {
    try {
      let cartData: any = req.body;
      if(!cartData){
        res.status(HttpStatusCodes.UNAUTHORIZED).json({ message: 'Please add the products to be removed from cart!' });
      }
      const info:ApiResponse = await this.orderService.removeItemToOrder(cartData,{userId:req.userId as string,isAdmin:req.isAdmin as boolean, permissions:req.permissions,userEmail:req.body.userEmail});
      res.status(info.status).json(info);
    } catch (error: any) {
      console.error('Error creating product:', error.message);
      res.status(HttpStatusCodes.BAD_REQUEST).json({ message: 'Failed to create product.' });
    }
  }

  async updateOrder_(req: Request, res: Response): Promise<void> {
    try {
      let cartData: any = req.body;
      if(!cartData){
        res.status(HttpStatusCodes.UNAUTHORIZED).json({ message: 'Please add the products to be removed from cart!' });
      }
      const info:ApiResponse = await this.orderService.updateItemToOrder(cartData,{userId:req.userId as string,isAdmin:req.isAdmin as boolean, permissions:req.permissions,userEmail:req.body.userEmail});
      res.status(info.status).json(info);
    } catch (error: any) {
      console.error('Error creating product:', error.message);
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to create product.' });
    }
  }

}

