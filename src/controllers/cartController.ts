import { Request, Response } from 'express';
import { CartOperationInput, ApiResponse } from '../interfaces/Cart/cart.interfaces';
import { UserInfo } from '../interfaces/User/user.dto';
import { CartService } from '../services/cartService';
import HttpStatusCodes from '../constants/statusCodes';

export class CartController {
  private cartService:CartService;
  constructor(cartService:CartService){
    this.cartService = cartService;
  }
    async getUserCart(req: Request, res: Response): Promise<void> {
        try {
            const userInfo: UserInfo = {
                userId: (req as any).userId,
                isAdmin: (req as any).isAdmin,
                userEmail: req.body.userEmail,
            };
            const result: ApiResponse = await this.cartService.getCart(userInfo, userInfo.userEmail);
            res.status(result.status).json(result);
        } catch (error: any) {
            console.error('Error getting user cart:', error.message);
            res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal Server Error' });
        }
    }

    async removeItemsFromCart(req: Request, res: Response): Promise<void> {
        try {
            const userInfo: UserInfo = {
                userId: (req as any).userId,
                isAdmin: (req as any).isAdmin,
                userEmail: req.body.userEmail,
            };
            const cartInput: CartOperationInput = {
                products: req.body.products,
                userEmail: req.body.userEmail,
            };

            if (!cartInput.products || cartInput.products.length === 0) {
                 res.status(HttpStatusCodes.BAD_REQUEST).json({ success: false, message: 'Please provide products to remove.' });
                 return;
            }
            const result: ApiResponse = await this.cartService.removeItemsFromCart(cartInput, userInfo);

            res.status(result.status).json(result);
        } catch (error: any) {
            console.error('Error removing items from cart:', error.message);
            res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal Server Error' });
        }
    }

    async addItemToCart(req: Request, res: Response): Promise<void> {
        try {
            const userInfo: UserInfo = {
                userId: (req as any).userId,
                isAdmin: (req as any).isAdmin,
                userEmail: req.body.userEmail,
            };

             const cartInput: CartOperationInput = {
                products: req.body.products,
                userEmail: req.body.userEmail,
            };

             if (!cartInput.products || cartInput.products.length === 0) {
                 res.status(HttpStatusCodes.BAD_REQUEST).json({ success: false, message: 'Please provide products to add.' });
                 return;
             }

            const result: ApiResponse = await this.cartService.addItemToCart(cartInput, userInfo);

            res.status(result.status).json(result);
        } catch (error: any) {
            console.error('Error adding item to cart:', error.message);
            res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to add item to cart.' });
        }
    }
    async updateCartItems(req: Request, res: Response): Promise<void> {
        try {
            const userInfo: UserInfo = {
                userId: (req as any).userId,
                isAdmin: (req as any).isAdmin,
                userEmail: req.body.userEmail?req.body.userEmail:'',
            };

            const cartInput: CartOperationInput = {
                products: req.body.products,
                userEmail: req.body.userEmail,
            };

             if (!cartInput.products || cartInput.products.length === 0) {
                 res.status(HttpStatusCodes.BAD_REQUEST).json({ success: false, message: 'Please provide products to update.' });
                 return;
             }
            const result: ApiResponse = await this.cartService.updateCartItems(cartInput, userInfo);

            res.status(result.status).json(result);
        } catch (error: any) {
            console.error('Error updating cart items:', error.message);
            res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to update cart items.' });
        }
    }
     async deleteCartForUser(req: Request, res: Response): Promise<void> {
         try {
             const userInfo: UserInfo = {
                 userId: (req as any).userId,
                 isAdmin: (req as any).isAdmin,
                 userEmail: req.body.userEmail,
             };

              const targetUserEmail = req.body.userEmail;

             const result: ApiResponse = await this.cartService.deleteCartForUser(userInfo, targetUserEmail);

             res.status(result.status).json(result);

         } catch (error: any) {
             console.error('Error deleting cart:', error.message);
             res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to delete cart.' });
         }
     }

}
