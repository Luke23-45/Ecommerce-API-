import express from 'express';
import { OrderController } from '../controllers/orderController';
import { authMiddleware,hasPermission } from './../middlewares/authMiddleware';
import { validateAddItemsToOrder,validateRemoveItemsFromOrder,validateUpdateOrderItems } from '../validators/orderValidation';

export const orderRoutes = (orderController:OrderController) => {
  const router = express.Router();
  router.post(
    '/addtoorder',
    authMiddleware,
    // (req, res, next) => hasPermission(req, res, next, "order:add"),
    validateAddItemsToOrder,
    (req, res) => orderController.addItemToOrder(req as any, res)
  );
  router.get(
    '/getorder',
    authMiddleware,
    // (req, res, next) => hasPermission(req, res, next, "order:add"),
    (req, res) => orderController.getOrder_(req as any, res)
  );
  router.post(
    '/getorder',
    authMiddleware,
    // (req, res, next) => hasPermission(req, res, next, "order:add"),
    (req, res) => orderController.getOrder_(req as any, res)
  );
  router.post(
    '/removeorder',
    authMiddleware,
    // (req, res, next) => hasPermission(req, res, next, "order:add"),
    validateRemoveItemsFromOrder,
    (req, res) => orderController.deleteOrder_(req as any, res)
  );
  router.post(
    '/updateorder',
    authMiddleware,
    validateUpdateOrderItems,
    // (req, res, next) => hasPermission(req, res, next, "order:add"),
    (req, res) => orderController.updateOrder_(req as any, res)
  );
return router  
}
