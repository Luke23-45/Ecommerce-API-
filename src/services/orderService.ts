// src/services/OrderService.ts

import { Types } from "mongoose";
import { IOrderRepository } from "../interfaces/Reprository/IOrderRepository";
import HttpStatusCodes from "../constants/statusCodes";
import { CartService } from "./cartService";
import { AuthService } from "./authService";
import { ProductService } from "./productService";
import {
  Item,
  UserInfo,
  OrderServiceApiResponse,
} from "../interfaces/Order/order.interfaces";

export class OrderService {
  private orderRepository: IOrderRepository;
  private cartService: CartService;
  private productService: ProductService;
  private authService: AuthService;
  constructor(
    orderRepository: IOrderRepository,
    cartService: CartService,
    productService: ProductService,
    authService: AuthService
  ) {
    this.orderRepository = orderRepository;
    this.cartService = cartService;
    this.productService = productService;
    this.authService = authService;
  }
  mergeArrays(array1: any, array2: any): any {
    const newArray = [...array1];

    for (const item2 of array2) {
      const existingItem1Index = newArray.findIndex(
        (item1: any) => item1.productId === item2.productId
      );
      if (existingItem1Index !== -1) {
        newArray[existingItem1Index].quantity += item2.quantity;
      } else {
        newArray.push(item2);
      }
    }
    return newArray;
  }

  private filterItemsNotInOtherArray(array1: any[], array2: any[]): any[] {
    const productIdsInArray2 = new Set(array2.map((item) => item.productId));
    const newArray = array1.filter(
      (item1) => !productIdsInArray2.has(item1.productId)
    );
    return newArray;
  }

  public processArrays(arr1: any[], arr2: any[]): any[] {
    console.log("Processing arrays internally...");
    const filteredArr1 = this.filterItemsNotInOtherArray(arr1, arr2);
    console.log(
      "Array 1 after filtering:",
      JSON.stringify(filteredArr1, null, 2)
    );
    return filteredArr1;
  }

  public updateStatusBasedOnArray2 = (
    array1: any[],
    array2: Item[]
  ): Item[] => {
    const array2Map = new Map<string, Item>();
    for (const item2 of array2) {
      if (item2 && item2.productId) {
        array2Map.set(item2.productId, item2);
      }
    }
    const newArray = array1.map((item1) => {
      if (item1 && item1.productId && array2Map.has(item1.productId)) {
        const matchingItem2 = array2Map.get(item1.productId);
        const item1Plain = (item1 as any).toObject
          ? (item1 as any).toObject()
          : item1;
        return {
          ...item1Plain,
          status: matchingItem2!.status,
        };
      } else {
        return (item1 as any).toObject ? (item1 as any).toObject() : item1;
      }
    });
    return newArray;
  };

  public addUniqueProducts(array1: any[], array2: any[]): any[] {
    const newArray = [...array1];
    const productIdsInArray1 = new Set(array1.map((item) => item.productId));

    for (const item2 of array2) {
      if (!productIdsInArray1.has(item2.productId)) {
        newArray.push(item2);
      }
    }
    return newArray;
  }
  private filterItemsPresentInOtherArray(
    sourceArray: any[],
    filterArray: any[]
  ): any[] {
    if (!Array.isArray(sourceArray) || !Array.isArray(filterArray)) {
      console.error(
        "filterItemsPresentInOtherArray received invalid input arrays."
      );
      return [];
    }

    const filterProductIds = new Set(
      filterArray
        .map((item) => {
          if (item && item.productId) {
            return typeof item.productId === "object" &&
              item.productId !== null &&
              item.productId.toString
              ? item.productId.toString()
              : String(item.productId);
          }
          return null;
        })
        .filter((id) => id !== null)
    );

    const filteredItems = sourceArray.filter((item) => {
      if (item && item.productId) {
        const sourceProductIdString =
          typeof item.productId === "object" &&
          item.productId !== null &&
          item.productId.toString
            ? item.productId.toString()
            : String(item.productId);
        return filterProductIds.has(sourceProductIdString);
      }
      return false;
    });

    return filteredItems;
  }
  private validateStatusUpdateForDoneItems(
    currentItems: any[],
    proposedUpdates: any[]
  ): {
    success: boolean;
    data: {
      productId: string;
      currentStatus: string;
      proposedStatus: string;
    }[];
  } {
    if (!Array.isArray(currentItems) || !Array.isArray(proposedUpdates)) {
      console.error(
        "validateStatusUpdateForDoneItems received invalid input arrays."
      );
      return { success: false, data: [] };
    }

    const proposedUpdatesMap = new Map<string, any>();
    proposedUpdates.forEach((u) => {
      if (u && u.productId && typeof u.status === "string") {
        const productIdString =
          typeof u.productId === "object" &&
          u.productId !== null &&
          u.productId.toString
            ? u.productId.toString()
            : String(u.productId);
        proposedUpdatesMap.set(productIdString, u);
      } else {
        console.warn("Invalid item structure in proposedUpdates:", u);
      }
    });

    const doneItemsAttemptedToChange: {
      productId: string;
      currentStatus: string;
      proposedStatus: string;
    }[] = [];

    currentItems.forEach((currentItem) => {
      if (
        currentItem &&
        currentItem.productId &&
        typeof currentItem.status === "string"
      ) {
        const currentProductIdString =
          typeof currentItem.productId === "object" &&
          currentItem.productId !== null &&
          currentItem.productId.toString
            ? currentItem.productId.toString()
            : String(currentItem.productId);

        if (proposedUpdatesMap.has(currentProductIdString)) {
          const proposedUpdate = proposedUpdatesMap.get(currentProductIdString);

          if (
            currentItem.status === "Done" &&
            proposedUpdate.status !== "Done"
          ) {
            doneItemsAttemptedToChange.push({
              productId: currentProductIdString,
              currentStatus: currentItem.status,
              proposedStatus: proposedUpdate.status,
            });
          }
        }
      } else {
        console.warn("Invalid item structure in currentItems:", currentItem);
      }
    });

    const success = doneItemsAttemptedToChange.length === 0;

    return {
      success: success,
      data: doneItemsAttemptedToChange,
    };
  }
  private async validateUserAndProducts(
    userInfo: UserInfo,
    orderData: any
  ): Promise<OrderServiceApiResponse | undefined> {
    const userExist_ = await this.authService.findById(`${userInfo.userId}`);
    if (!userExist_) {
      return {
        status: HttpStatusCodes.UNAUTHORIZED,
        success: false,
        message: "User does not exist!",
      };
    }

    if (!orderData.products || orderData.products.length === 0) {
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Please add the products to be processed!",
      };
    }
    if (!Array.isArray(orderData.products)) {
      return {
        success: false,
        message: "Products must be an array.",
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      };
    }

    for (const product of orderData.products) {
      if (!Types.ObjectId.isValid(product.productId)) {
        return {
          success: false,
          message: "Invalid product ID format.",
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        };
      }
    }
    return undefined;
  }

  private async fetchProductData(
    modelName: "Cart" | "Order",
    userId: Types.ObjectId | string,
    targetProductId: string,
    itemsField: string
  ): Promise<any | undefined> {
    try {
      if (modelName === "Cart") {
        return await this.orderRepository.findProductItemInOrderUsingAggregation(
          modelName,
          userId,
          targetProductId
        );
      } else if (modelName === "Order") {
        return await this.orderRepository.findProductItemInOrderUsingAggregation(
          modelName,
          userId,
          targetProductId
        );
      }
      return undefined;
    } catch (error) {
      console.error(
        `Error finding product ${targetProductId} in ${modelName} for user ${userId} using aggregation:`,
        error
      );
      return undefined;
    }
  }

  async addItemToOrder(
    orderData: any,
    userInfo: UserInfo
  ): Promise<OrderServiceApiResponse> {
    try {
      const validationError = await this.validateUserAndProducts(
        userInfo,
        orderData
      );
      if (validationError) {
        return validationError;
      }

      if (!userInfo.isAdmin || (userInfo.isAdmin && !userInfo.userEmail)) {
        let cartInfo: any = await this.cartService.findByUserId(
          userInfo.userId
        );

        orderData["userId"] = userInfo.userId;
        if (!cartInfo || !cartInfo.products || cartInfo.products.length == 0) {
          return {
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message:
              "No product found in cart. Please add the product to the cart.",
          };
        }
        let dataCart: any[] = [];

        for (const product of orderData.products) {
          const foundProductItem = await this.fetchProductData(
            "Cart",
            userInfo.userId,
            product.productId,
            "products"
          );
          if (foundProductItem) {
            delete foundProductItem._id;
            dataCart.push({
              ...foundProductItem,
              status: product.status,
            });
          }
        }

        if (dataCart.length == 0) {
          return {
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Nothing to add to order!",
          };
        }

        orderData.items = dataCart;
        const existingOrder = await this.orderRepository.findOneByUserId(
          userInfo.userId
        );
        let savedOrder: any = "";

        if (!existingOrder) {
          const newOrder = await this.orderRepository.create(orderData);
          savedOrder = newOrder;
        } else {
          dataCart = this.addUniqueProducts(existingOrder.items, dataCart);
          savedOrder = await this.orderRepository.findByIdAndUpdate(
            `${existingOrder._id}`,
            { $set: { items: dataCart } },
            { new: true }
          );
        }

        await this.cartService.removeItemsFromCart(
          { products: orderData.products },
          {
            userId: userInfo.userId,
            isAdmin: userInfo.isAdmin,
            userEmail: userInfo.userEmail,
          }
        );
        return {
          status: HttpStatusCodes.CREATED,
          success: true,
          message: savedOrder as object,
        };
      } else if (userInfo.isAdmin) {
        if (!userInfo.userEmail) {
          return {
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Please add the email for the user!",
          };
        } else {
          const userData = await this.authService.findByEmail(
            userInfo.userEmail
          );
          if (!userData) {
            return {
              status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
              success: false,
              message: "Invalid emails!",
            };
          } else {
            orderData["userId"] = userData._id;
            orderData["userEmail"] = userInfo.userEmail;
            orderData["createdBy"] = "Admin";
            let cartInfo: any = await this.cartService.findByUserId(
              `${userData._id}`
            );

            if (
              !cartInfo ||
              !cartInfo.products ||
              cartInfo.products.length == 0
            ) {
              return {
                status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                success: false,
                message:
                  "No product found in cart. Please add the product to the cart.",
              };
            }
            let dataCart: any[] = [];

            for (const product of orderData.products) {
              const foundProductItem = await this.fetchProductData(
                "Cart",
                `${userData._id}`,
                product.productId,
                "products"
              );
              if (foundProductItem) {
                delete foundProductItem._id;
                dataCart.push({
                  ...foundProductItem,
                  status: product.status,
                });
              }
            }

            if (dataCart.length == 0) {
              return {
                status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Nothing to add to order!",
              };
            }

            orderData.items = dataCart;
            const existingOrder = await this.orderRepository.findOneByUserId(
              `${userData._id}`
            );
            let savedOrder: any = "";

            if (!existingOrder) {
              const newOrder = await this.orderRepository.create(orderData);
              savedOrder = newOrder;
            } else {
              dataCart = this.addUniqueProducts(existingOrder.items, dataCart);
              savedOrder = await this.orderRepository.findByIdAndUpdate(
                `${existingOrder._id}`,
                { $set: { items: dataCart } },
                { new: true }
              );
            }

            await this.cartService.removeItemsFromCart(
              { products: orderData.products },
              {
                userId: userInfo.userId,
                isAdmin: userInfo.isAdmin,
                userEmail: userInfo.userEmail,
              }
            );
            return {
              status: HttpStatusCodes.CREATED,
              success: true,
              message: savedOrder as object,
            };
          }
        }
      }
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Could not add the product!",
      };
    } catch (error: any) {
      console.error("Error adding item to order:", error.message);
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Failed to add item to order due to a server error.",
      };
    }
  }

  async removeItemToOrder(
    orderData: any,
    userInfo: UserInfo
  ): Promise<OrderServiceApiResponse> {
    try {
      const validationError = await this.validateUserAndProducts(
        userInfo,
        orderData
      );
      if (validationError) {
        return validationError;
      }

      if (!userInfo.isAdmin || (userInfo.isAdmin && !userInfo.userEmail)) {
        let orderInfo: any = await this.orderRepository.findOneByUserId(
          userInfo.userId
        );
        if (!orderInfo || !orderInfo.items || orderInfo.items.length == 0) {
          return {
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message:
              "No product found in order. Please add the product to the order.",
          };
        }
        let dataToRemove: any[] = [];
        const messages: any[] = [];
        for (const product of orderData.products) {
          const foundProductItem = await this.fetchProductData(
            "Order",
            userInfo.userId,
            product.productId,
            "items"
          );
          if (foundProductItem) {
            if (foundProductItem.status === "Done") {
              messages.push({
                productId: foundProductItem._id,
                message: "The product status is Done! Could not be removed!",
              });
            } else {
              delete foundProductItem._id;
              dataToRemove.push({ ...foundProductItem });
            }
          }
        }

        if (dataToRemove.length === 0 && messages.length === 0) {
          return {
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: "No valid items found to remove.",
          };
        }

        const existingOrder = await this.orderRepository.findOneByUserId(
          userInfo.userId
        );
        if (!existingOrder) {
          console.error("Order not found for user:", userInfo.userId);
          return {
            success: false,
            message: "Order not found.",
            status: HttpStatusCodes.NOT_FOUND,
          };
        }

        let finalItems: any = this.processArrays(
          existingOrder.items,
          dataToRemove
        );
        const data = this.filterItemsPresentInOtherArray(
          existingOrder.items,
          dataToRemove
        );
        const updatedOrder = await this.orderRepository.findByIdAndUpdate(
          `${existingOrder._id}`,
          { $set: { items: finalItems } },
          { new: true }
        );
        const inventoryUpdates = data.map((pd) => ({
          productId: pd.productId,
          quantityChange: pd.quantity,
        }));
        const inventoryResult =
          await this.productService.increaseProductInventory(inventoryUpdates);
        if (!inventoryResult.success) {
          return {
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message:
              inventoryResult.errors ||
              "Failed to update product inventory, likely due to concurrent modification or insufficient stock.",
          };
        }

        if (!updatedOrder) {
          console.error(
            "Order not found after update attempt:",
            existingOrder._id
          );
          return {
            success: false,
            message: "Order not found after update attempt.",
            status: HttpStatusCodes.NOT_FOUND,
          };
        }

        console.log(
          "Database updated successfully with new items:",
          updatedOrder.items
        );
        return {
          status: HttpStatusCodes.OK,
          success: true,
          data: { messages: messages, newOrder: updatedOrder },
        };
      } else if (userInfo.isAdmin) {
        if (!userInfo.userEmail) {
          return {
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            data: { message: "Please add the email for the user!" },
          };
        } else {
          const userData = await this.authService.findByEmail(
            userInfo.userEmail
          );
          if (!userData) {
            return {
              status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
              success: false,
              data: { message: "Invalid emails!" },
            };
          } else {
            let orderInfo: any = await this.orderRepository.findOneByUserId(
              `${userData._id}`
            );
            if (!orderInfo || !orderInfo.items || orderInfo.items.length == 0) {
              return {
                status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                success: false,
                message:
                  "No product found in order. Please add the product to the order.",
              };
            }
            let dataToRemove: any[] = [];
            const messages: any[] = [];

            for (const product of orderData.products) {
              const foundProductItem = await this.fetchProductData(
                "Order",
                `${userData._id}`,
                product.productId,
                "items"
              );
              if (foundProductItem) {
                if (foundProductItem.status === "Done") {
                  messages.push({
                    productId: foundProductItem._id,
                    message:
                      "The product status is Done! Could not be removed!",
                  });
                } else {
                  delete foundProductItem._id;
                  dataToRemove.push({ ...foundProductItem });
                }
              }
            }

            if (dataToRemove.length === 0 && messages.length === 0) {
              return {
                status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                success: false,
                message: "No valid items found to remove.",
              };
            }

            const existingOrder = await this.orderRepository.findOneByUserId(
              `${userData._id}`
            );
            if (!existingOrder) {
              console.error("Order not found for user:", userInfo.userId);
              return {
                success: false,
                message: "Order not found.",
                status: HttpStatusCodes.NOT_FOUND,
              };
            }
            let finalItems: any = this.processArrays(
              existingOrder.items,
              dataToRemove
            );
            const updatedOrder = await this.orderRepository.findByIdAndUpdate(
              `${existingOrder._id}`,
              { $set: { items: finalItems } },
              { new: true }
            );
            if (!updatedOrder) {
              console.error(
                "Order not found after update attempt:",
                existingOrder._id
              );
              return {
                success: false,
                message: "Order not found after update attempt.",
                status: HttpStatusCodes.NOT_FOUND,
              };
            }
            console.log(
              "Database updated successfully with new items:",
              updatedOrder.items
            );
            return {
              status: HttpStatusCodes.OK,
              success: true,
              data: { messages: messages, newOrder: updatedOrder },
            };
          }
        }
      }
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        data: { message: "Could not remove the product!" },
      };
    } catch (error: any) {
      console.error("Error removing item from order:", error.message);
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Failed to remove item from order due to a server error.",
      };
    }
  }

  async getOrder(userInfo: UserInfo): Promise<OrderServiceApiResponse> {
    try {
      const userExist_ = await this.authService.findById(`${userInfo.userId}`);
      if (!userExist_) {
        return {
          status: HttpStatusCodes.NOT_FOUND,
          success: false,
          message: "User does not exist!",
        };
      }
      if (!userInfo.isAdmin || (userInfo.isAdmin && !userInfo.userEmail)) {
        const orderData = await this.orderRepository.findOneByUserId(
          userInfo.userId
        );
        return { status: HttpStatusCodes.OK, success: true, data: orderData };
      } else if (userInfo.isAdmin) {
        if (!userInfo.userEmail) {
          return {
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Please add the email for the user!",
          };
        } else {
          const userData = await this.authService.findByEmail(
            userInfo.userEmail
          );
          if (!userData) {
            return {
              status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
              success: false,
              message: "Invalid emails!",
            };
          } else {
            const orderData = await this.orderRepository.findOneByUserId(
              `${userData._id}`
            );
            return {
              status: HttpStatusCodes.OK,
              success: true,
              data: orderData,
            };
          }
        }
      }
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Could not find the order!",
      };
    } catch (error: any) {
      console.error("Error getting order:", error.message);
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Failed to retrieve order due to a server error.",
      };
    }
  }

  async updateItemToOrder(
    orderData: any,
    userInfo: UserInfo
  ): Promise<OrderServiceApiResponse> {
    try {
      const validationError = await this.validateUserAndProducts(
        userInfo,
        orderData
      );
      if (validationError) {
        return validationError;
      }

      if (!userInfo.isAdmin || (userInfo.isAdmin && !userInfo.userEmail)) {
        let orderInfo: any = await this.orderRepository.findOneByUserId(
          userInfo.userId
        );
        if (!orderInfo || !orderInfo.items || orderInfo.items.length == 0) {
          return {
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message:
              "No product found in order. Please add the product to the order.",
          };
        }
        let dataToUpdate: any[] = [];
        const messages: any[] = [];

        for (let i = 0; i < orderData.products.length; i++) {
          const productInput = orderData.products[i];
          const foundProductItem = await this.fetchProductData(
            "Order",
            userInfo.userId,
            productInput.productId,
            "items"
          );
          console.log("this is from 2", foundProductItem);

          if (foundProductItem) {
            if (!productInput.status) {
              messages.push({
                productId: foundProductItem._id,
                message:
                  "The product status is not provided. Please add the status to be updated.",
              });
            } else {
              delete foundProductItem._id;
              dataToUpdate.push({
                ...foundProductItem,
                status: productInput.status,
              });
            }
          }
        }

        if (dataToUpdate.length === 0 && messages.length === 0) {
          return {
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: "No valid items found to update.",
          };
        }

        const existingOrder = await this.orderRepository.findOneByUserId(
          userInfo.userId
        );
        if (!existingOrder) {
          console.error("Order not found for user:", userInfo.userId);
          return {
            success: false,
            message: "Order not found.",
            status: HttpStatusCodes.NOT_FOUND,
          };
        }

        const data = this.validateStatusUpdateForDoneItems(
          existingOrder.items,
          dataToUpdate
        );

        if (!data.success) {
          return {
            success: false,
            message: "Attempted to change the status of Done item.",
            status: HttpStatusCodes.UNAUTHORIZED,
            data: data.data,
          };
        }
        let updatedItems: any = this.updateStatusBasedOnArray2(
          existingOrder.items,
          dataToUpdate
        );
        const updatedOrder = await this.orderRepository.findByIdAndUpdate(
          `${existingOrder._id}`,
          { $set: { items: updatedItems } },
          { new: true }
        );

        if (!updatedOrder) {
          console.error(
            "Order not found after update attempt:",
            existingOrder._id
          );
          return {
            success: false,
            message: "Order not found after update attempt.",
            status: HttpStatusCodes.NOT_FOUND,
          };
        }

        console.log(
          "Database updated successfully with new items:",
          updatedOrder.items
        );
        return {
          status: HttpStatusCodes.OK,
          success: true,
          data: { messages: messages, newOrder: updatedOrder },
        };
      } else if (userInfo.isAdmin) {
        if (!userInfo.userEmail) {
          return {
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            data: { message: "Please add the email for the user!" },
          };
        } else {
          const userData = await this.authService.findByEmail(
            userInfo.userEmail
          );
          if (!userData) {
            return {
              status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
              success: false,
              data: { message: "Invalid emails!" },
            };
          } else {
            let orderInfo: any = await this.orderRepository.findOneByUserId(
              `${userData._id}`
            );
            if (!orderInfo || !orderInfo.items || orderInfo.items.length == 0) {
              return {
                status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                success: false,
                message:
                  "No product found in order. Please add the product to the order.",
              };
            }
            let dataToUpdate: any[] = [];
            const messages: any[] = [];

            for (let i = 0; i < orderData.products.length; i++) {
              const productInput = orderData.products[i];
              const foundProductItem = await this.fetchProductData(
                "Order",
                `${userData._id}`,
                productInput.productId,
                "items"
              );
              if (foundProductItem) {
                if (!productInput.status) {
                  messages.push({
                    productId: foundProductItem._id,
                    message:
                      "The product status is not provided. Please add the status to be updated.",
                  });
                } else {
                  delete foundProductItem._id;
                  dataToUpdate.push({
                    ...foundProductItem,
                    status: productInput.status,
                  });
                }
              }
            }
            if (dataToUpdate.length === 0 && messages.length === 0) {
              return {
                status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                success: false,
                message: "No valid items found to update.",
              };
            }
            const existingOrder = await this.orderRepository.findOneByUserId(
              `${userData._id}`
            );
            if (!existingOrder) {
              console.error("Order not found for user:", userInfo.userId);
              return {
                success: false,
                message: "Order not found.",
                status: HttpStatusCodes.NOT_FOUND,
              };
            }
            let updatedItems: any = this.updateStatusBasedOnArray2(
              existingOrder.items,
              dataToUpdate
            );
            const updatedOrder = await this.orderRepository.findByIdAndUpdate(
              `${existingOrder._id}`,
              { $set: { items: updatedItems } },
              { new: true }
            );
            if (!updatedOrder) {
              console.error(
                "Order not found after update attempt:",
                existingOrder._id
              );
              return {
                success: false,
                message: "Order not found after update attempt.",
                status: HttpStatusCodes.NOT_FOUND,
              };
            }
            console.log(
              "Database updated successfully with new items:",
              updatedOrder.items
            );
            return {
              status: HttpStatusCodes.OK,
              success: true,
              data: { messages: messages, newOrder: updatedOrder },
            };
          }
        }
      }
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        data: { message: "Could not update the product!" },
      };
    } catch (error: any) {
      console.error("Error updating item in order:", error.message);
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Failed to update item in order due to a server error.",
      };
    }
  }
}
