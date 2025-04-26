// src/compositionRoot.ts

import express from "express";

//  Importing all concrete implementations

// Repositories
import { OrderRepository } from "./Repository/orderRepository";
import { CartRepository } from "./Repository/cartRepository";
import { ProductRepository } from "./Repository/productRepository";
import { UserRepository } from "./Repository/userRepository";
import { CategoryRepository } from "./Repository/CategoryRepository";

// Services
import { OrderService } from "./services/orderService";
import { ProductService } from "./services/productService";
import { CartService } from "./services/cartService";
import { AuthService } from "./services/authService";
import { CategoryService } from "./services/CategoryService";

// Controller
import { OrderController } from "./controllers/orderController";
import { CartController } from "./controllers/cartController";
import { ProductController } from "./controllers/productController";
import { AuthController } from "./controllers/authController";


// Route setup functions
import { orderRoutes } from "./routes/orderRoutes";
import { cartRoutes } from "./routes/cartRoutes";
import { productRoutes } from "./routes/productRoutes";
import { authRoutes } from "./routes/authRoutes";

//  Create and wire up dependencies

// Level 1 & 2: Repositories (instantiatedfirst as they have minimal dependencies)
const orderRepository = new OrderRepository();
const cartRepository = new CartRepository();
const productRepository = new ProductRepository();
const userRepository = new UserRepository();
const categoryRepository = new CategoryRepository();

// Level 3: Services (instantiate, injecting repositories and other services)

const authService = new AuthService(userRepository);

// CategoryService needs: ICategoryRepository
const categoryService = new CategoryService(categoryRepository);

// ProductService needs: IProductRepository, ICategoryService
const productService = new ProductService(
  productRepository,
  categoryService,
  authService
);

const cartService = new CartService(
  cartRepository,
  productService,
  authService
);

// OrderService needs: IOrderRepository, IUserRepository, ICartService
const orderService = new OrderService(
  orderRepository,
  cartService,
  productService,
  authService
);

// Level 4: Controllers (instantiate, injecting Services)

// AuthController needs: IAuthService
const authController = new AuthController(authService);

// ProductController needs: IProductService
const productController = new ProductController(productService);

// CartController needs: ICartService
const cartController = new CartController(cartService);

// OrderController needs: IOrderService
const orderController = new OrderController(orderService);

//  Exposing what the application entry point needs

//  Express router instances, configured with their controllers and middleware.

const configureApp = (app: express.Application): express.Application => {
  //  Mount Routers
  // Call the route definition functions with wired controllers and middleware

  app.use("/api/auth", authRoutes(authController));
  app.use("/api/product", productRoutes(productController)); 
  app.use("/api/cart", cartRoutes(cartController)); 
  app.use("/api/order", orderRoutes(orderController)); 
  return app;
};

export { configureApp };
