// src/repositories/OrderRepository.ts

import OrderModel from "../models/Order";
import {
  IOrderRepository,
  IOrderDocument,
} from "../interfaces/Reprository/IOrderRepository";
import { IOrder } from "../interfaces/Order/order.interfaces";
import { Types } from "mongoose";
import Order from "../models/Order";
import Cart from "../models/Cart";

export class OrderRepository implements IOrderRepository {
  async findOneByUserId(
    userId: Types.ObjectId | string
  ): Promise<IOrderDocument | null> {
    return await OrderModel.findOne({ userId: userId });
  }
  async create(orderData: Partial<IOrder>): Promise<IOrderDocument | any> {
    const newOrder = new OrderModel(orderData);
    const savedOrder = await newOrder.save();
    return savedOrder;
  }

  async findByIdAndUpdate(
    id: Types.ObjectId | string,
    update: any,
    options?: any
  ): Promise<IOrderDocument | any> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return await OrderModel.findByIdAndUpdate(id, update, options);
  }
  async findProductItemInOrderUsingAggregation(modelName:string,
    userId: Types.ObjectId | string,
    targetProductId: string
  ): Promise<any | undefined> {
    try {
      if (!Types.ObjectId.isValid(targetProductId)) {
        console.warn(
          `findProductItemInOrderUsingAggregation: Invalid targetProductId format: ${targetProductId}`
        );
        return undefined;
      }
      let nameOfModel:any = Order;
      if(modelName == "Cart"){
        nameOfModel = Cart;
      }
      let aggregationResult = [];
      if(modelName == "Cart"){
         aggregationResult = await nameOfModel.aggregate([
          { $match: { userId: userId } },
          {
            $project: {
              matchingProduct: {
                $filter: {
                  input: "$products",
                  as: "product",
                  cond: {
                    $eq: ["$$product.productId", targetProductId],
                  },
                },
              },
            },
          },
          {
            $unwind: {
              path: "$matchingProduct",
              preserveNullAndEmptyArrays: false,
            },
          },
        ]);
      }else if(modelName == "Order"){
         aggregationResult = await nameOfModel.aggregate([
          { $match: { userId: userId } },
          {
            $project: {
              matchingProduct: {
                $filter: {
                  input: "$items",
                  as: "product",
                  cond: {
                    $eq: ["$$product.productId", targetProductId],
                  },
                },
              },
            },
          },
          {
            $unwind: {
              path: "$matchingProduct",
              preserveNullAndEmptyArrays: false,
            },
          },
        ]);
      }

      return aggregationResult.length > 0
        ? aggregationResult[0].matchingProduct
        : undefined;
    } catch (error) {
      console.error(
        `Error finding product ${targetProductId} in Order for user ${userId} using aggregation:`,
        error
      );
      return undefined;
    }
  }
}
