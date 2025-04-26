// src/services/authService.ts

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  IUserRepository,
  IUserDocument,
} from "../interfaces/Reprository/IUserRepository";
import config from "../config/config";
import { ApiResponse } from "../interfaces/Services/ApiResponse.type";
import HttpStatusCodes from "../constants/statusCodes";


export class AuthService {
  private userRepository: IUserRepository;
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }
  private generateAccessToken(user: IUserDocument): string {
    return jwt.sign(
      {
        userId: user._id,
        isAdmin: user.isAdmin,
        permissions: user.permissions,
      },
      config.jwtSecret,
      {
        expiresIn: "100000000000000000000m",
      }
    );
  }
  async register(email: string, password: string): Promise<ApiResponse> {
    const userExists = await this.userRepository.existsByEmail(email);
    if (userExists) {
      return {
        status: HttpStatusCodes.UNAUTHORIZED,
        success: false,
        message: "User already exist with this email!",
      };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.userRepository.create({
      email,
      password: hashedPassword,
    });
    let userInfo = newUser.toObject();
    userInfo = {
      email: userInfo.email,
      isAdmin: userInfo.isAdmin,
      permissions: userInfo.permission,
      userId: userInfo._id,
    };
    return {
      status: HttpStatusCodes.CREATED,
      success: true,
      message: "Your registration Completed!",
      data: userInfo,
    };
  }

  async login(email: string, password: string): Promise<ApiResponse> {
    const user = await this.userRepository.findByEmailWithPassword(email);
    if (!user) {
      return {
        status: HttpStatusCodes.UNAUTHORIZED,
        success: false,
        message: "User does not exist with this email!",
      };
    }
    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      return {
        status: HttpStatusCodes.UNAUTHORIZED,
        success: false,
        message: "Wrong password!",
      };
    }
    const accessToken = this.generateAccessToken(user);
    return {
      status: HttpStatusCodes.CREATED,
      success: true,
      message: "You successfully login!",
      data: { token: accessToken },
    };
  }
  async findById(userId: string): Promise<IUserDocument | null> {
    return this.userRepository.findById(userId);
  }
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.userRepository.findByEmail(email);
  }
}
