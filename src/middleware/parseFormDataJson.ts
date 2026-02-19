import { Request, Response, NextFunction } from "express";

/**
 * Middleware to parse JSON strings in FormData body fields
 * This is needed because FormData sends nested objects as JSON strings
 */
export const parseFormDataJson = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // Fields that might contain JSON strings
  const jsonFields = ["venue", "scheduleItems"];

  jsonFields.forEach((field) => {
    if (req.body[field] && typeof req.body[field] === "string") {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch (error) {
        // If parsing fails, leave it as is (validation will catch it)
        console.warn(`Failed to parse JSON for field ${field}:`, error);
      }
    }
  });

  next();
};
