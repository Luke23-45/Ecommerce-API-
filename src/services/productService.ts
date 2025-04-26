// src/services/productService.ts

import { Types } from "mongoose";
import {
  IProductRepository,
  IProductDocument,
} from "../interfaces/Reprository/IProductRepository";
import { IProduct } from "../interfaces/Product/IProduct";
import { IUserDocument } from "../interfaces/Reprository/IUserRepository";
import { ApiResponse } from "../interfaces/Services/ApiResponse.type";
import HttpStatusCodes from "../constants/statusCodes";
import { CategoryService } from "./CategoryService";
import { AuthService } from "./authService";
import { InventoryUpdateResult } from "../interfaces/Cart/cart.interfaces";

export class ProductService {
  private productRepository: IProductRepository;
  private categoryService: CategoryService;
  private authService: AuthService;

  constructor(
    productRepository: IProductRepository,
    categoryService: CategoryService,
    authService: AuthService
  ) {
    this.productRepository = productRepository;
    this.authService = authService;
    this.categoryService = categoryService;
  }

  private async _ensureUserExists(
    userId: string
  ): Promise<{ status: number; json: any } | null> {
    const userExists = await this.authService.findById(userId);
    if (!userExists) {
      return { status: 404, json: { message: "User does not exist!" } };
    }
    return null;
  }
  private async _validateEmail(email?: string): Promise<{
    error?: { status: number; json: any };
    userData?: IUserDocument;
  }> {
    if (!email) {
      return {
        error: {
          status: 400,
          json: { message: "Please add the email for the user!" },
        },
      };
    }
    const userData = await this.authService.findByEmail(email);
    if (!userData) {
      return { error: { status: 400, json: { message: "Invalid emails!" } } };
    }
    return { userData };
  }
  async increaseProductInventory(
    updates: { productId: string | Types.ObjectId; quantityChange: number }[]
  ): Promise<InventoryUpdateResult> {
    if (updates.length === 0) {
      return { success: true };
    }
    const bulkOps = updates.map((update) => {
      const objectId =
        update.productId instanceof Types.ObjectId
          ? update.productId
          : new Types.ObjectId(update.productId);
      return {
        updateOne: {
          filter: { _id: objectId }, 
          update: {
            $inc: { inventory: update.quantityChange },
          },
        },
      };
    });

    try {

      const result = await this.productRepository.bulkWrite(bulkOps);

      if (result.modifiedCount !== updates.length) {
        console.warn(
          `Bulk inventory increase: Attempted ${updates.length}, Modified ${result.modifiedCount}. Some products not found or updated.`
        );
      
        return { success: true }; 
      }

      return { success: true }; 
    } catch (error: any) {
      console.error("Error performing bulk inventory increase:", error);
      return {
        success: false,
        errors: error.message || "Bulk inventory increase failed.",
      };
    }
  }

   async updateProductInventory(
    updates: { productId: Types.ObjectId; quantityChange: number }[]
  ): Promise<InventoryUpdateResult> {
    if (updates.length === 0) {
      return { success: true };
    }

    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: {
          _id: update.productId,
          inventory: { $gte: update.quantityChange },
        },
        update: {
          $inc: { inventory: -update.quantityChange },
        },
      },
    }));

    try {
      const result = await this.productRepository.bulkWrite(bulkOps);

      if (result.modifiedCount !== updates.length) {
        return {
          success: false,
          errors:
            "One or more products had insufficient stock during the final update attempt.",
        };
      }
      return { success: true };
    } catch (error: any) {
      console.error("Error performing bulk inventory update:", error);
      return {
        success: false,
        errors: error.message || "Bulk inventory update failed.",
      };
    }
  }
  async createProduct(
    productData: IProduct,
    userInfo: any
  ): Promise<ApiResponse> {
    try {
      const categoryName = productData.category;

      if (categoryName && typeof categoryName === "string") {
        let category = await this.categoryService.findCategoryByName(
          categoryName
        );
        if (!category) {
          try {
            category = await this.categoryService.createCategory(categoryName);
            console.log(`Created new category: ${categoryName}`);
          } catch (error: any) {
            console.error(
              `Error creating category ${categoryName}:`,
              error.message
            );
            if (error.code === 11000) {
              category = await this.categoryService.findCategoryByName(
                categoryName
              );
            } else {
              throw error;
            }
            if (!category) {
              throw new Error(
                `Failed to find or create category: ${categoryName}`
              );
            }
          }
        }
      } else {
        console.warn("Category name is missing or invalid in product data.");
      }
      const userError = await this._ensureUserExists(productData.userId);
      if (userError)
        return {
          status: HttpStatusCodes.NOT_FOUND,
          success: false,
          message: "User does not exist with the ID!",
        };

      if (!userInfo.isAdmin || (userInfo.isAdmin && !productData.userEmail)) {
        productData["userId"] = productData.userId;
        let newProduct = await this.productRepository.create(productData);
        return {
          status: HttpStatusCodes.CREATED,
          success: true,
          message: "the product has been added!",
          data: newProduct,
        };
      }
      if (userInfo.isAdmin) {
        const { error, userData } = await this._validateEmail(
          productData.userEmail
        );
        if (error) {
          return {
            status: HttpStatusCodes.NOT_FOUND,
            success: false,
            message: "Admin: Please add the correct email of the user!",
          };
        }
        productData["userId"] = productData.userId;
        productData["userEmail"] = productData.userEmail;
        productData["createdBy"] = "Admin";
        const newProduct = await this.productRepository.create(productData);
        return {
          status: HttpStatusCodes.CREATED,
          success: true,
          message: "the product has been added!",
          data: newProduct,
        };
      }
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Could not add the product!",
      };
    } catch (error: any) {
      console.error("Error creating product:", error.message);
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Failed to create product due to a server error.",
      };
    }
  }
  public async setProductInventory(
    updates: { productId: string | Types.ObjectId; quantity: number }[]
): Promise<InventoryUpdateResult> {
    if (updates.length === 0) {
        return { success: true };
    }

    const errors: string[] = [];


    const bulkOps = updates.map((update, index) => {
  
         if (!update || typeof update !== 'object' || !update.productId || typeof update.quantity !== 'number' || !Number.isInteger(update.quantity) || update.quantity < 0) {
              errors.push(`Invalid set update object at index ${index}. Each update requires a valid productId and a non-negative integer quantity.`);
              return null; 
         }

         if (!Types.ObjectId.isValid(update.productId)) {
             errors.push(`Invalid productId format at index ${index}.`);
             return null; 
         }

        const objectId = update.productId instanceof Types.ObjectId ? update.productId : new Types.ObjectId(update.productId);

        return {
            updateOne: {
                filter: {
                     _id: objectId,
                     $expr: {
                          $lte: [update.quantity, "$inventory"]  
                     }
                },

                update: {
                    $set: { inventory: update.quantity },
                },
                 upsert: false, 
            },
        };
    }).filter(op => op !== null); 

     if (errors.length > 0) {
          return {
               success: false,
               errors: "Validation failed before performing bulk set: " + errors.join(", ")
          };
     }
    if (bulkOps.length === 0) {
         return { success: true }; 
     }


    try {
      
        const result = await this.productRepository.bulkWrite(bulkOps);

        if (result.modifiedCount !== bulkOps.length) {
             console.warn(`Bulk inventory set: Attempted ${bulkOps.length}, Modified ${result.modifiedCount}. Some updates failed the condition or product not found.`);
             return {
                  success: false, 
                  errors: `Inventory set failed for ${bulkOps.length - result.modifiedCount} product(s). Target quantity was greater than current inventory or product ID not found.`,
             };
        }
        return { success: true }; 
    } catch (error: any) {
        console.error("Error performing bulk inventory set:", error);
        return {
            success: false,
            errors: error.message || "Bulk inventory set failed.",
        };
    }
}
  async getAllProducts(): Promise<ApiResponse> {
    const products = await this.productRepository.find(
      {},
      "name description price category inventory image"
    );
    return {
      status: HttpStatusCodes.CREATED,
      success: true,
      message: "All the Products!",
      data: products,
    };
  }

  async getAllProductsForUser(userInfo: any): Promise<ApiResponse> {
    try {
      const userError = await this._ensureUserExists(userInfo.userId);
      if (userError)
        return {
          status: HttpStatusCodes.NOT_FOUND,
          success: false,
          message: "User does not exist with the ID!",
        };

      if (!userInfo.isAdmin || (userInfo.isAdmin && !userInfo.userEmail)) {
        const Products = await this.productRepository.find({
          userId: userInfo.userId,
        });
        return {
          status: HttpStatusCodes.CREATED,
          success: true,
          message: "All the Products for the user!",
          data: Products,
        };
      }

      if (userInfo.isAdmin) {
        if (!userInfo.userEmail) {
          return {
            status: HttpStatusCodes.BAD_REQUEST,
            success: false,
            message: "Please add the email for the user!",
          };
        }
        const { error, userData } = await this._validateEmail(
          userInfo.userEmail
        );
        if (error) {
          return {
            status: HttpStatusCodes.BAD_REQUEST,
            success: false,
            message: "Please add the correct email for the user!",
          };
        }
        const userId = userData ? userData._id : null;
        const Products = await this.productRepository.find({ userId: userId });
        return {
          status: HttpStatusCodes.CREATED,
          success: true,
          message: "All the Products for the user!",
          data: Products,
        };
      }

      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Could not add the product!",
      };
    } catch (error: any) {
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Failed to create product due to a server error.",
      };
    }
  }

  async getProductById(id: string): Promise<ApiResponse> {
    if (!Types.ObjectId.isValid(id)) {
      return {
        status: HttpStatusCodes.NOT_FOUND,
        success: false,
        message: "Please provide the valid ID",
      };
    }
    // 'name description price category inventory image'
    let product: any = await this.productRepository.findById(id);
    product = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      inventory: product.inventory,
      image: product.image,
    };

    return {
      status: HttpStatusCodes.FOUND,
      success: true,
      message: "Product Found!",
      data: product,
    };
  }

  async updateProduct(
    id: string,
    updateData: Partial<IProduct>,
    userInfo: any
  ): Promise<ApiResponse> {
    try {
      const userError = await this._ensureUserExists(userInfo.userId);
      if (userError)
        return {
          status: HttpStatusCodes.NOT_FOUND,
          success: false,
          message: "User does not exist with the ID!",
        };

      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        return {
          status: HttpStatusCodes.NOT_FOUND,
          success: false,
          message: "Product does not exist with the ID!",
        };
      }
      const categoryName = existingProduct.category;

      if (categoryName && typeof categoryName === "string") {
        let category = await this.categoryService.findCategoryByName(
          categoryName
        );
        if (!category) {
          try {
            category = await this.categoryService.createCategory(categoryName);
            console.log(`Created new category: ${categoryName}`);
          } catch (error: any) {
            console.error(
              `Error creating category ${categoryName}:`,
              error.message
            );
            if (error.code === 11000) {
              category = await this.categoryService.findCategoryByName(
                categoryName
              );
            } else {
              throw error;
            }
            if (!category) {
              throw new Error(
                `Failed to find or create category: ${categoryName}`
              );
            }
          }
        }
      } else {
        console.warn("Category name is missing or invalid in product data.");
      }
      if (!userInfo.isAdmin || (userInfo.isAdmin && !updateData.userEmail)) {
        if (existingProduct.userId?.toString() !== userInfo.userId) {
          return {
            status: HttpStatusCodes.NON_AUTHORITATIVE_INFORMATION,
            success: false,
            message: "Unauthorized to update this product.",
          };
        }
        let product: any = await this.productRepository.update(id, updateData);

        product = {
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          inventory: product.inventory,
          image: product.image,
        };
        return {
          status: HttpStatusCodes.OK,
          success: true,
          message: "the product has been updated!",
          data: product,
        };
      }

      if (userInfo.isAdmin) {
        const { error, userData } = await this._validateEmail(
          updateData.userEmail as string
        );
        if (error) {
          return {
            status: HttpStatusCodes.NOT_FOUND,
            success: false,
            message: "Admin: Please add the correct email of the user!",
          };
        }
        updateData["updatedBy"] = "Admin";
        updateData["userEmail"] = "";
        let product: any = await this.productRepository.update(id, updateData);
        product = {
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          inventory: product.inventory,
          image: product.image,
        };
        return {
          status: HttpStatusCodes.OK,
          success: true,
          message: "the product has been updated!",
          data: product,
        };
      }

      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Could not update the product!",
      };
    } catch (error: any) {
      console.error("Error update product:", error.message);
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Failed to create product due to a server error.",
      };
    }
  }

  async deleteProduct(productId: string, userInfo: any): Promise<ApiResponse> {
    try {
      if (!Types.ObjectId.isValid(productId)) {
        return {
          status: HttpStatusCodes.NOT_FOUND,
          success: false,
          message: "Invalid product ID format.",
        };
      }
      const existingProduct = await this.productRepository.findById(productId);
      if (!existingProduct) {
        return {
          status: HttpStatusCodes.NOT_FOUND,
          success: false,
          message: "Product Not Found!",
        };
      }
      if (!userInfo.isAdmin) {
        if (existingProduct.userId?.toString() !== userInfo.userId) {
          return {
            status: HttpStatusCodes.FORBIDDEN,
            success: false,
            message: "Unauthorized to delete this product.",
          };
        }
        const deletedProduct = await this.productRepository.delete(productId);
        if (!deletedProduct) {
          return {
            status: HttpStatusCodes.NOT_FOUND,
            success: false,
            message: "Product not found after attempting deletion.",
          };
        }
        return {
          status: HttpStatusCodes.NO_CONTENT,
          success: true,
          message: "Product has been deleted",
        };
      } else {
        const deletedProduct = await this.productRepository.delete(productId);
        if (!deletedProduct) {
          return {
            status: HttpStatusCodes.NOT_FOUND,
            success: false,
            message: "Product not found after attempting deletion.",
          };
        }
        return {
          status: HttpStatusCodes.NO_CONTENT,
          success: true,
          message: "Product has been deleted",
        };
      }
    } catch (error: any) {
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Failed to delete product due to a server error.",
      };
    }
  }
  //exposing the productRepository from productServices for other services access from productServices
  async findProductsByIds(
    ids: Types.ObjectId[],
    projection?: any
  ): Promise<IProductDocument[]> {
    return this.productRepository.findProductsByIds(ids, projection);
  }

  async bulkWrite(bulkOps: any[]): Promise<any> {
    return this.productRepository.bulkWrite(bulkOps);
  }
}
