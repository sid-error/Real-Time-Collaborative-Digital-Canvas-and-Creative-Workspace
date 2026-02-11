/**
 * @fileoverview Unit tests for the errorHandler middleware and utilities.
 */

const { AppError, errorHandler, asyncHandler } = require("../../middleware/errorHandler");

// Helper to create mock Express response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Helper to create mock Express request object
const mockRequest = () => ({});

describe("AppError class", () => {
  test("should create an error with a message and status code", () => {
    const error = new AppError("Not Found", 404);
    expect(error.message).toBe("Not Found");
    expect(error.statusCode).toBe(404);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  test("should capture a stack trace", () => {
    const error = new AppError("Test error", 500);
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("Test error");
  });

  test("should handle different status codes", () => {
    const badRequest = new AppError("Bad request", 400);
    const unauthorized = new AppError("Unauthorized", 401);
    const forbidden = new AppError("Forbidden", 403);

    expect(badRequest.statusCode).toBe(400);
    expect(unauthorized.statusCode).toBe(401);
    expect(forbidden.statusCode).toBe(403);
  });
});

describe("errorHandler middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = jest.fn();
    // Suppress console.error during tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should handle AppError with correct status code and message", () => {
    const err = new AppError("Custom error", 422);

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 422,
        message: "Custom error",
      })
    );
  });

  test("should default to 500 status code when none is provided", () => {
    const err = new Error("Generic error");

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 500,
        message: "Generic error",
      })
    );
  });

  test("should default message to 'Internal Server Error' when none provided", () => {
    const err = {};
    err.statusCode = undefined;
    err.message = undefined;

    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Internal Server Error",
      })
    );
  });

  test("should handle ValidationError from Mongoose", () => {
    const err = {
      name: "ValidationError",
      errors: {
        name: { message: "Name is required" },
        email: { message: "Email is invalid" },
      },
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Name is required, Email is invalid",
      })
    );
  });

  test("should handle duplicate key error (code 11000)", () => {
    const err = {
      code: 11000,
      keyPattern: { email: 1 },
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "email already exists",
      })
    );
  });

  test("should handle JsonWebTokenError", () => {
    const err = {
      name: "JsonWebTokenError",
      message: "jwt malformed",
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Invalid token",
      })
    );
  });

  test("should handle TokenExpiredError", () => {
    const err = {
      name: "TokenExpiredError",
      message: "jwt expired",
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Token expired",
      })
    );
  });

  test("should handle CastError", () => {
    const err = {
      name: "CastError",
      path: "_id",
      value: "invalid-id",
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Invalid _id: invalid-id",
      })
    );
  });

  test("should include stack trace in development mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const err = new AppError("Dev error", 500);

    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        stack: expect.any(String),
      })
    );

    process.env.NODE_ENV = originalEnv;
  });

  test("should NOT include stack trace in production mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const err = new AppError("Prod error", 500);

    errorHandler(err, req, res, next);

    const calledWith = res.json.mock.calls[0][0];
    expect(calledWith.stack).toBeUndefined();

    process.env.NODE_ENV = originalEnv;
  });
});

describe("asyncHandler utility", () => {
  test("should call the wrapped function with req, res, next", async () => {
    const fn = jest.fn().mockResolvedValue(undefined);
    const wrappedFn = asyncHandler(fn);
    const req = {};
    const res = {};
    const next = jest.fn();

    await wrappedFn(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res, next);
  });

  test("should pass errors to next() when the async function rejects", async () => {
    const error = new Error("Async failure");
    const fn = jest.fn().mockRejectedValue(error);
    const wrappedFn = asyncHandler(fn);
    const req = {};
    const res = {};
    const next = jest.fn();

    await wrappedFn(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  test("should not call next with an error when async function resolves", async () => {
    const fn = jest.fn().mockResolvedValue("ok");
    const wrappedFn = asyncHandler(fn);
    const req = {};
    const res = {};
    const next = jest.fn();

    await wrappedFn(req, res, next);

    expect(next).not.toHaveBeenCalled();
  });
});
