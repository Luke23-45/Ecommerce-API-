import express from 'express';
import { CartController } from '../controllers/cartController';
import { authMiddleware,hasPermission } from './../middlewares/authMiddleware';
import { validateAddOrUpdateCartItems, validateRemoveCartItems } from '../validators/cartValidation';


export const cartRoutes = (cartController:CartController) =>{
  const router = express.Router();

  // Add an item to the cart
  router.post(
    '/addtocart',
    authMiddleware,
    validateAddOrUpdateCartItems,
    (req, res, next) => hasPermission(req, res, next, "cart:add"),
    (req, res) => cartController.addItemToCart(req as any, res)
  );
  router.get(
    '/getcart',
    authMiddleware,
    (req, res) => cartController.getUserCart(req as any, res)
  );
  router.post(
    '/getcart',
    authMiddleware,
    (req, res) => cartController.getUserCart(req as any, res)
  );
  router.post(
    '/removecart',
    authMiddleware,
    validateRemoveCartItems,
    (req, res) => cartController.removeItemsFromCart(req as any, res)
  );
  router.post(
    '/updatecart',
    authMiddleware,
    validateAddOrUpdateCartItems,
    (req, res) =>cartController.updateCartItems(req as any, res)
  );
return router;  
}

