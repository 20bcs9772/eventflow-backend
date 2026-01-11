import { Request, Response, NextFunction } from "express";
import * as admin from "firebase-admin";
import { AppError } from "./errorHandler";
import userService from "../services/user.service";
import { UserRole } from "@prisma/client";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        name?: string;
        picture?: string;
        authProvider: "EMAIL" | "GOOGLE" | "APPLE";
      };
    }
  }
}

/**
 * Middleware to verify Firebase ID token
 * Extracts user information from the token and attaches to request
 */
export const verifyFirebaseToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No authorization token provided", 401);
    }

    const idToken = authHeader.split("Bearer ")[1];

    if (!idToken) {
      throw new AppError("Invalid authorization token format", 401);
    }

    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Determine auth provider from Firebase token
    let authProvider: "EMAIL" | "GOOGLE" | "APPLE" = "EMAIL";

    if (decodedToken.firebase?.sign_in_provider) {
      const provider = decodedToken.firebase.sign_in_provider;
      if (provider === "google.com") {
        authProvider = "GOOGLE";
      } else if (provider === "apple.com") {
        authProvider = "APPLE";
      }
    }

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      authProvider,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else if ((error as any).code === "auth/id-token-expired") {
      next(new AppError("Token has expired", 401));
    } else if ((error as any).code === "auth/argument-error") {
      next(new AppError("Invalid token", 401));
    } else {
      console.error("Token verification error:", error);
      next(new AppError("Authentication failed", 401));
    }
  }
};

/**
 * Optional auth middleware - doesn't fail if no token provided
 * Useful for endpoints that work differently for authenticated vs anonymous users
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const idToken = authHeader.split("Bearer ")[1];

    if (!idToken) {
      return next();
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    let authProvider: "EMAIL" | "GOOGLE" | "APPLE" = "EMAIL";

    if (decodedToken.firebase?.sign_in_provider) {
      const provider = decodedToken.firebase.sign_in_provider;
      if (provider === "google.com") {
        authProvider = "GOOGLE";
      } else if (provider === "apple.com") {
        authProvider = "APPLE";
      }
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      authProvider,
    };

    next();
  } catch (error) {
    // If token verification fails, continue without user
    next();
  }
};

/**
 * Middleware to check if user has admin role
 * Must be used after verifyFirebaseToken
 */
export const requireAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.user.uid) {
    return next(new AppError("Authentication required", 401));
  }

  try {
    const user = await userService.getUserByFirebaseUid(req.user.uid);

    if (!user || user.role !== UserRole.ADMIN) {
      return next(new AppError("Admin role required", 403));
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
