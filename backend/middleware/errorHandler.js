/**
 * @fileoverview Global error handling middleware and utilities for standardizing API responses.
 */

/**
 * Custom error class for application-specific errors.
 * @extends Error
 */
class AppError extends Error {
  /**
   * Create an AppError.
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code associated with the error.
   */
  constructor(message, statusCode) {
    // Call the parent Error class constructor with the message
    super(message);
    // Assign the HTTP status code to the error instance
    this.statusCode = statusCode;
    // Capture the stack trace, excluding the constructor call itself
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware for Express.
 * Standardizes all error responses across the API and handles specific Mongoose/JWT errors.
 * 
 * @param {Error|AppError} err - The error object.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  // Set default status code to 500 if not provided
  err.statusCode = err.statusCode || 500;
  // Set default message if not provided
  err.message = err.message || "Internal Server Error";

  // Handle errors specifically from Mongoose validation
  if (err.name === "ValidationError") {
    // Extract all validation error messages and join them with commas
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    // Convert to a 400 Bad Request error
    err = new AppError(message, 400);
  }

  // Handle Mongoose duplicate key errors (e.g., duplicate username/email)
  if (err.code === 11000) {
    // Get the first field that caused the conflict
    const field = Object.keys(err.keyPattern)[0];
    // Create a user-friendly error message
    const message = `${field} already exists`;
    // Convert to a 400 Bad Request error
    err = new AppError(message, 400);
  }

  // Handle errors with JSON Web Tokens (invalid signature, etc.)
  if (err.name === "JsonWebTokenError") {
    // Set to 401 Unauthorized
    err = new AppError("Invalid token", 401);
  }

  // Handle expired JSON Web Tokens
  if (err.name === "TokenExpiredError") {
    // Set to 401 Unauthorized
    err = new AppError("Token expired", 401);
  }

  // Handle MongoDB CastErrors (e.g., passing a malformed ID)
  if (err.name === "CastError") {
    // Create a message specifying the path and value that failed
    const message = `Invalid ${err.path}: ${err.value}`;
    // Convert to a 400 Bad Request error
    err = new AppError(message, 400);
  }

  // Log the error details with a timestamp for server-side debugging
  console.error(
    `[${new Date().toISOString()}] ${err.statusCode} - ${err.message}`,
  );

  // Send a JSON response with the error details
  res.status(err.statusCode).json({
    // Indicate failure
    success: false,
    // Provide the status code
    statusCode: err.statusCode,
    // Provide the error message
    message: err.message,
    // Include the stack trace only if running in development mode
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Higher-order function to wrap asynchronous route handlers and catch errors.
 * Errors are caught and passed to the next() middleware (the global error handler).
 * 
 * @param {Function} fn - The asynchronous function to wrap.
 * @returns {Function} Express middleware function.
 */
const asyncHandler = (fn) => (req, res, next) => {
  // Wrap the async function in a Promise and catch any errors, passing them to next()
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Export the error utilities and middleware
module.exports = {
  AppError,
  errorHandler,
  asyncHandler,
};


