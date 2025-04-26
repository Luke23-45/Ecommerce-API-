// src/services/CartService.ts
import { Types } from "mongoose";
import {
  CartProductInput,
  CartOperationInput,
  CartProductInternal,
  CartDocumentInternal,
  UserResolutionResult,
  InventoryUpdateResult,
  ProductDocumentInternal,
} from "../interfaces/Cart/cart.interfaces";
import { UserInfo } from "../interfaces/User/user.dto";
import { ApiResponse } from "../interfaces/Cart/cart.interfaces";
import { ICartRepository } from "../interfaces/Reprository/ICartRepository";
import HttpStatusCodes from "../constants/statusCodes";
import { ProductService } from "./productService";
import { AuthService } from "./authService";

export class CartService {
  private cartRepository: ICartRepository;
  private productService: ProductService;
  private authService: AuthService;

  constructor(
    cartRepository: ICartRepository,
    productService: ProductService,
    authService: AuthService
  ) {
    this.cartRepository = cartRepository;
    this.productService = productService;
    this.authService = authService;
  }

  private mergeCartProducts(
    existingProducts: CartProductInternal[],
    newProducts: CartProductInput[]
  ): CartProductInternal[] {
    const productMap = new Map<string, CartProductInternal>();

    existingProducts.forEach((p) => {
      const plainProduct = p.toObject ? p.toObject() : { ...p };
      const productIdStr = plainProduct.productId.toString();
      productMap.set(productIdStr, plainProduct);
    });

    newProducts.forEach((np) => {
      const productIdStr = np.productId.toString();
      if (productMap.has(productIdStr)) {
        const existing = productMap.get(productIdStr)!;
        existing.quantity += np.quantity;
      } else {
        productMap.set(productIdStr, {
          productId: new Types.ObjectId(np.productId),
          quantity: np.quantity,
        } as CartProductInternal);
      }
    });

    return Array.from(productMap.values());
  }

  private async validateAndFetchProducts(
    productInputs: CartProductInput[]
  ): Promise<{
    errors: string[];
    productsData: {
      input: CartProductInput;
      dbProduct: ProductDocumentInternal;
    }[];
  }> {
    const errors: string[] = [];
    const productIds: Types.ObjectId[] = [];
    const productInputMap = new Map<string, CartProductInput>();

    if (!productInputs || productInputs.length === 0) {
      errors.push("No products provided.");
      return { errors, productsData: [] };
    }

    for (const item of productInputs) {
      if (!item.productId || item.quantity == null || item.quantity <= 0) {
        errors.push(
          `Product ID or valid quantity (> 0) is missing/invalid for one or more items.`
        );
        continue;
      }
      if (!Types.ObjectId.isValid(item.productId)) {
        errors.push(`Invalid product ID format: ${item.productId}.`);
        continue;
      }
      const id = new Types.ObjectId(item.productId);
      const idStr = id.toString();
      if (productInputMap.has(idStr)) {
        errors.push(
          `Duplicate productId found in input: ${idStr}. Combine quantities first.`
        );
        continue;
      }
      productIds.push(id);
      productInputMap.set(idStr, item);
    }

    if (errors.length > 0) {
      return { errors, productsData: [] };
    }

    const productsFromDb = (await this.productService.findProductsByIds(
      productIds,
      "inventory"
    )) as ProductDocumentInternal[];
    const productDbMap = new Map<string, ProductDocumentInternal>(
      productsFromDb.map((p) => [p._id.toString(), p])
    );
    const productsData: {
      input: CartProductInput;
      dbProduct: ProductDocumentInternal;
    }[] = [];
    for (const idStr of productInputMap.keys()) {
      const dbProduct = productDbMap.get(idStr);
      const inputProduct = productInputMap.get(idStr)!;

      if (!dbProduct) {
        errors.push(`Product not found with ID: ${idStr}.`);
      } else if (dbProduct.inventory < inputProduct.quantity) {
        errors.push(
          `Insufficient stock for product ID ${idStr}. Available: ${dbProduct.inventory}, Requested: ${inputProduct.quantity}.`
        );
      } else {
        productsData.push({ input: inputProduct, dbProduct });
      }
    }

    if (productsData.length !== productInputMap.size) {
      return { errors, productsData: [] };
    }

    return { errors, productsData };
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
  private filterProductsToRemove(
    currentProducts: CartProductInternal[],
    productsToRemove: CartProductInput[]
  ): CartProductInternal[] {
    const productIdsToRemove = new Set(
      productsToRemove.map((item) => item.productId.toString())
    );
    return currentProducts.filter(
      (item) => !productIdsToRemove.has(item.productId.toString())
    );
  }

  private mergeAndReplaceProducts(
    currentProducts: CartProductInternal[],
    productsToUpdate: CartProductInput[]
  ): CartProductInternal[] {
    const productMap = new Map<string, CartProductInternal>();
    currentProducts.forEach((p) => {
      const plainProduct = p.toObject ? p.toObject() : { ...p };
      productMap.set(plainProduct.productId.toString(), plainProduct);
    });

    productsToUpdate.forEach((pUpdate) => {
      const idStr = pUpdate.productId.toString();
      productMap.set(idStr, {
        productId: new Types.ObjectId(pUpdate.productId),
        quantity: pUpdate.quantity,
      } as CartProductInternal);
    });

    return Array.from(productMap.values());
  }

  private mergeAndUpdateProducts(
    currentProducts: any[],
    productsToUpdate: any[]
  ): any[] {
    if (!Array.isArray(currentProducts) || !Array.isArray(productsToUpdate)) {
      console.error("mergeAndReplaceProducts received invalid input arrays.");
      return [];
    }

    const productMap = new Map<string, any>();

    currentProducts.forEach((p) => {
      if (p && p.productId) {
        const plainProduct = p.toObject ? p.toObject() : { ...p };

        const productIdString =
          typeof plainProduct.productId === "object" &&
          plainProduct.productId !== null &&
          plainProduct.productId.toString
            ? plainProduct.productId.toString()
            : String(plainProduct.productId);
        productMap.set(productIdString, plainProduct);
      }
    });

    productsToUpdate.forEach((pUpdate) => {
      if (
        pUpdate &&
        pUpdate.productId &&
        typeof pUpdate.quantity === "number"
      ) {
        const updateProductIdString =
          typeof pUpdate.productId === "object" &&
          pUpdate.productId !== null &&
          pUpdate.productId.toString
            ? pUpdate.productId.toString()
            : String(pUpdate.productId);

        if (productMap.has(updateProductIdString)) {
          const currentProduct = productMap.get(updateProductIdString);

          const newQuantity = currentProduct.quantity - pUpdate.quantity;

          currentProduct.quantity = newQuantity;
          productMap.set(updateProductIdString, currentProduct);
        }
      } else {
        console.warn("Invalid update item provided for subtraction:", pUpdate);
      }
    });

    return Array.from(productMap.values());
  }
  private async _resolveTargetUser(
    userInfo: UserInfo,
    targetEmail?: string | null
  ): Promise<UserResolutionResult> {
    try {
      const actingUser = await this.authService.findById(`${userInfo.userId}`);
      if (!actingUser) {
        return {
          userId: null,
          isAdminAction: false,
          error: {
            status: HttpStatusCodes.UNAUTHORIZED,
            success: false,
            message: "Requesting user not found.",
          },
        };
      }

      let isAdminAction = false;
      let targetUserId: Types.ObjectId | null = null;

      if (userInfo.isAdmin && targetEmail) {
        isAdminAction = true;
        const targetUserData = await this.authService.findByEmail(targetEmail);
        if (!targetUserData) {
          return {
            userId: null,
            isAdminAction,
            error: {
              status: HttpStatusCodes.UNAUTHORIZED,
              success: false,
              message: `Target user not found with email: ${targetEmail}.`,
            },
          };
        }
        (targetUserId as any) = targetUserData._id;
      } else {
        isAdminAction = userInfo.isAdmin;
        targetUserId = new Types.ObjectId(userInfo.userId);
      }

      if (!targetUserId) {
        console.error(
          "Failed to determine target user ID despite passing initial checks."
        );
        return {
          userId: null,
          isAdminAction: false,
          error: {
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Internal error determining target user.",
          },
        };
      }
      return { userId: targetUserId, isAdminAction };
    } catch (error: any) {
      console.error("Error resolving target user ID:", error);
      return {
        userId: null,
        isAdminAction: false,
        error: {
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
          success: false,
          message: "Server error while identifying target user.",
        },
      };
    }
  }

  private async _getCartForUser(
    userId: Types.ObjectId
  ): Promise<CartDocumentInternal | null> {
    try {
      return await this.cartRepository.findByUserId(userId);
    } catch (error) {
      console.error(`Error fetching cart for user ${userId}:`, error);
      return null;
    }
  }

  async addItemToCart(
    cartInput: CartOperationInput,
    userInfo: UserInfo
  ): Promise<ApiResponse> {
    try {
      const userResolution = await this._resolveTargetUser(
        userInfo,
        cartInput.userEmail
      );
      if (userResolution.error) return userResolution.error;
      if (!userResolution.userId) {
        return {
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
          success: false,
          message: "Failed to identify target user.",
        };
      }
      const targetUserId = userResolution.userId;
      const createdOrModifiedBy = userResolution.isAdminAction
        ? "Admin"
        : "User";

      const { errors: validationErrors, productsData } =
        await this.validateAndFetchProducts(cartInput.products);
      if (validationErrors.length > 0) {
        return {
          status: HttpStatusCodes.BAD_REQUEST,
          success: false,
          message: { validationErrors: validationErrors },
        };
      }

      const inventoryUpdates = productsData.map((pd) => ({
        productId: pd.dbProduct._id,
        quantityChange: pd.input.quantity,
      }));
      const inventoryResult = await this.productService.updateProductInventory(
        inventoryUpdates
      );
      if (!inventoryResult.success) {
        return {
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
          success: false,
          message:
            inventoryResult.errors ||
            "Failed to update product inventory, likely due to concurrent modification or insufficient stock.",
        };
      }
      let finalCart: CartDocumentInternal | null = null;
      const existingCart = await this._getCartForUser(targetUserId);

      if (existingCart) {
        const mergedProducts = this.mergeCartProducts(
          existingCart.products,
          cartInput.products
        );
        existingCart.products =
          mergedProducts as Types.DocumentArray<CartProductInternal>;
        existingCart.markModified("products");
        if (userResolution.isAdminAction) existingCart.updatedBy = "Admin";
        finalCart = await this.cartRepository.save(existingCart);
      } else {
        const newCartData = {
          userId: targetUserId,
          products: productsData.map((pd) => ({
            productId: pd.dbProduct._id,
            quantity: pd.input.quantity,
          })),
        };
        const newCart = await this.cartRepository.create(newCartData);
        (finalCart as any) = newCart;
      }

      const message = `Cart ${
        existingCart ? "updated" : "created"
      } successfully.`;
      return {
        status: HttpStatusCodes.CREATED,
        success: true,
        message: message,
        data: finalCart,
      };
    } catch (error: any) {
      console.error("Error adding item to cart:", error.message, error.stack);
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Failed to add item to cart due to a server error.",
      };
    }
  }

  async getCart(
    userInfo: UserInfo,
    targetUserEmail?: string
  ): Promise<ApiResponse> {
    try {
      const userResolution = await this._resolveTargetUser(
        userInfo,
        targetUserEmail
      );
      if (userResolution.error) return userResolution.error;
      if (!userResolution.userId) {
        return {
          status: HttpStatusCodes.UNAUTHORIZED,
          success: false,
          message: "Failed to identify target user.",
        };
      }
      const targetUserId = userResolution.userId;

      const cart = await this._getCartForUser(targetUserId);

      if (!cart) {
        return {
          status: HttpStatusCodes.UNAUTHORIZED,
          success: false,
          message: "Cart not found for this user.",
        };
      }

      return {
        status: HttpStatusCodes.ACCEPTED,
        success: true,
        message: "Cart retrieved successfully.",
        data: cart,
      };
    } catch (error: any) {
      console.error("Error getting cart:", error.message);
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Failed to retrieve cart due to a server error.",
      };
    }
  }

  async removeItemsFromCart(
    cartInput: CartOperationInput,
    userInfo: UserInfo
  ): Promise<ApiResponse> {
    try {
      const userResolution = await this._resolveTargetUser(
        userInfo,
        cartInput.userEmail
      );
      if (userResolution.error) return userResolution.error;
      if (!userResolution.userId) {
        return {
          status: HttpStatusCodes.UNAUTHORIZED,
          success: false,
          message: "Failed to identify target user.",
        };
      }
      const targetUserId = userResolution.userId;

      const existingCart = await this._getCartForUser(targetUserId);
      if (!existingCart) {
        return {
          status: HttpStatusCodes.NOT_FOUND,
          success: false,
          message: "Cannot remove items: Cart not found.",
        };
      }

      const invalidIds = cartInput.products
        .filter((p) => !p.productId || !Types.ObjectId.isValid(p.productId))
        .map((p) => p.productId);
      if (invalidIds.length > 0) {
        return {
          status: HttpStatusCodes.BAD_REQUEST,
          success: false,
          message: `Invalid product ID format provided: ${invalidIds.join(
            ", "
          )}`,
        };
      }

      const productsBeforeRemoval = existingCart.products.toObject();
      const remainingProducts = this.filterProductsToRemove(
        productsBeforeRemoval,
        cartInput.products
      );

      const data = this.filterItemsPresentInOtherArray(
        productsBeforeRemoval,
        cartInput.products
      );

      existingCart.products =
        remainingProducts as Types.DocumentArray<CartProductInternal>;
      existingCart.markModified("products");
      if (userResolution.isAdminAction) existingCart.updatedBy = "Admin";

      const updatedCart = await this.cartRepository.save(existingCart);
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
      return {
        status: HttpStatusCodes.ACCEPTED,
        success: true,
        message: "Items removed from cart successfully.",
        data: updatedCart,
      };
    } catch (error: any) {
      console.error("Error removing items from cart:", error.message);
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Failed to remove items from cart due to a server error.",
      };
    }
  }

  async updateCartItems(
    cartInput: CartOperationInput,
    userInfo: UserInfo
  ): Promise<ApiResponse> {
    try {
      const userResolution = await this._resolveTargetUser(
        userInfo,
        cartInput.userEmail
      );
      if (userResolution.error) return userResolution.error;
      if (!userResolution.userId) {
        return {
          status: HttpStatusCodes.UNAUTHORIZED,
          success: false,
          message: "Failed to identify target user.",
        };
      }
      const targetUserId = userResolution.userId;

      const existingCart = await this._getCartForUser(targetUserId);
      if (!existingCart) {
        return {
          status: HttpStatusCodes.NOT_FOUND,
          success: false,
          message: "Cannot update items: Cart not found.",
        };
      }

      
      const productsToUpdate = cartInput.products;
      const productsBeforeUpdate = existingCart.products.toObject();
      const data = this.mergeAndUpdateProducts(
        productsBeforeUpdate,
        productsToUpdate
      );

      const inventoryUpdates = data.map((pd) => ({
        productId: pd.productId,
        quantityChange: pd.quantity,
      }));
      //const toIncrease
      //cartquantity - updatedquantity;
      //positive then increase
      // if it is negative decrease;
      const toIncrease = inventoryUpdates.filter((pa) => pa.quantityChange > 0);
      let toDecrease = inventoryUpdates.filter((pa) => pa.quantityChange < 0);

      toDecrease = toDecrease.map((pd) =>({
        productId: pd.productId,
        quantityChange: (-1)*pd.quantityChange
      }))

    const decResult = await this.productService.updateProductInventory(toDecrease)
    const incResult = await this.productService.increaseProductInventory(toIncrease);

    if (!decResult.success || !incResult.success) {
        return {
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
          success: false,
          message:
            "Failed to update product inventory, likely due to concurrent modification or insufficient stock.",
        };
      }
      const newProductList = this.mergeAndReplaceProducts(
        productsBeforeUpdate,
        productsToUpdate
      );

      existingCart.products =
        newProductList as Types.DocumentArray<CartProductInternal>;
      existingCart.markModified("products");
      if (userResolution.isAdminAction) existingCart.updatedBy = "Admin";

      const updatedCart = await this.cartRepository.save(existingCart);

      return {
        status: HttpStatusCodes.OK,
        success: true,
        message: "Cart items updated successfully.",
        data: updatedCart,
      };
    } catch (error: any) {
      console.error("Error updating cart items:", error.message);
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Failed to update cart items due to a server error.",
      };
    }
  }

  async deleteCartForUser(
    userInfo: UserInfo,
    targetUserEmail?: string
  ): Promise<ApiResponse> {
    try {
      const userResolution = await this._resolveTargetUser(
        userInfo,
        targetUserEmail
      );
      if (userResolution.error) return userResolution.error;
      if (!userResolution.userId) {
        return {
          status: HttpStatusCodes.UNAUTHORIZED,
          success: false,
          message: "Failed to identify target user.",
        };
      }
      const targetUserId = userResolution.userId;
      const userCart = await this._getCartForUser(targetUserId);
      let deletionResult = {
        deletedCount: 0,
      };

      if (deletionResult.deletedCount === 0) {
        return {
          status: HttpStatusCodes.NOT_FOUND,
          success: false,
          message: "Cart not found, nothing to delete.",
        };
      }
      return {
        status: HttpStatusCodes.OK,
        success: true,
        message: "Cart deleted successfully.",
      };
    } catch (error: any) {
      console.error("Error deleting cart:", error.message);
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Failed to delete cart due to a server error.",
      };
    }
  }
  async findByUserId(
    userId: Types.ObjectId | string
  ): Promise<CartDocumentInternal | null> {
    return this.cartRepository.findByUserId(userId);
  }
}
