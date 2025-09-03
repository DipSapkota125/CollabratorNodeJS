// errorListening.ts
import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";

// Extend Error type to cover MongoDB, JWT, Multer, etc.
interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  path?: string;
  keyValue?: Record<string, any>;
  errors?: Record<string, { message: string }>;
  reason?: { message: string };
}

export const errorListening = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  // Wrong MongoDB ID (CastError)
  if (err.name === "CastError") {
    const message = `Resource not found: Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Duplicate Key Error
  if (err.code === 11000) {
    const message = `Duplicate field value entered: ${Object.keys(
      err.keyValue || {}
    ).join(", ")}`;
    err = new ErrorHandler(message, 400);
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    err = new ErrorHandler("Invalid token, please try again", 400);
  }

  if (err.name === "TokenExpiredError") {
    err = new ErrorHandler("Your token has expired, please log in again", 400);
  }

  // Multer File Upload Error
  if (err.name === "MulterError") {
    err = new ErrorHandler(`File upload error: ${err.message}`, 400);
  }

  // ENOTFOUND (Database or Host Connection Error)
  if (err.name === "ENOTFOUND") {
    err = new ErrorHandler(`Unable to connect to server: ${err.message}`, 503);
  }

  // Validation Errors
  if (err.name === "ValidationError" && err.errors) {
    const message = Object.values(err.errors)
      .map((value) => value.message)
      .join(", ");
    err = new ErrorHandler(message, 400);
  }

  // MongoDB Write Concern Error
  if (err.name === "WriteConcernError") {
    err = new ErrorHandler(
      `Database write operation failed: ${err.message}`,
      500
    );
  }

  // Mongoose Connection Error
  if (err.name === "MongooseServerSelectionError") {
    err = new ErrorHandler(
      `Database connection error: ${
        err.reason?.message || "Unable to connect to the database"
      }`,
      503
    );
  }

  // General Network Error
  if (err.name === "NetworkError") {
    err = new ErrorHandler(`A network error occurred: ${err.message}`, 503);
  }

  // Unhandled Syntax Errors
  if (err.name === "SyntaxError") {
    err = new ErrorHandler(`Unexpected syntax in request: ${err.message}`, 400);
  }

  // Default Error Response
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.name,
    message: err.message,
  });
};
