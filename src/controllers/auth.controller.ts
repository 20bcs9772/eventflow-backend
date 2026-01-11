import { Request, Response } from "express";
import authService from "../services/auth.service";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthProvider } from "@prisma/client";

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user after Firebase authentication
   * Called from mobile app after successful Firebase signup
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { name } = req.body;

    const user = await authService.registerOrLoginUser({
      firebaseUid: req.user.uid,
      email: req.user.email,
      name: name || req.user.name,
      avatarUrl: req.user.picture,
      authProvider: req.user.authProvider as AuthProvider,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  });

  /**
   * POST /api/auth/login
   * Login user - creates account if doesn't exist (for social logins)
   * Called from mobile app after successful Firebase signin
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await authService.registerOrLoginUser({
      firebaseUid: req.user.uid,
      email: req.user.email,
      name: req.user.name || req.body.name,
      avatarUrl: req.user.picture,
      authProvider: req.user.authProvider as AuthProvider,
    });

    res.json({
      success: true,
      message: "Login successful",
      data: user,
    });
  });

  /**
   * GET /api/auth/me
   * Get current authenticated user's profile
   */
  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await authService.getCurrentUser(req.user.uid);

    res.json({
      success: true,
      data: user,
    });
  });

  /**
   * PATCH /api/auth/profile
   * Update current user's profile
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { name, avatarUrl } = req.body;

    const user = await authService.updateProfile(req.user.uid, {
      name,
      avatarUrl,
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  });

  /**
   * DELETE /api/auth/account
   * Delete current user's account
   */
  deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await authService.deleteAccount(req.user.uid);

    res.json({
      success: true,
      message: result.message,
    });
  });

  /**
   * POST /api/auth/verify
   * Verify if the current token is valid
   * Useful for checking auth state on app startup
   */
  verifyToken = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Check if user exists in database
    const user = await authService.getUserByFirebaseUid(req.user.uid);

    res.json({
      success: true,
      message: "Token is valid",
      data: {
        isRegistered: !!user,
        user: user || null,
      },
    });
  });
}

export default new AuthController();
