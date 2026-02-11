/**
 * @fileoverview Unit tests for the authh authentication middleware.
 */

const jwt = require("jsonwebtoken");

// Mock the User model
jest.mock("../../models/User", () => ({
  findById: jest.fn(),
}));

const User = require("../../models/User");
const authh = require("../../middleware/authh");

// Helper to create mock Express objects
const mockRequest = (headers = {}) => ({
  header: jest.fn((name) => headers[name]),
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("authh middleware", () => {
  let req, res, next;
  const JWT_SECRET = "test-jwt-secret";

  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  beforeEach(() => {
    res = mockResponse();
    next = jest.fn();
    jest.clearAllMocks();
    // Suppress console.error during tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should return 401 when no Authorization header is provided", async () => {
    req = mockRequest({});

    await authh(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Access denied. No token provided.",
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 when Authorization header is empty", async () => {
    req = mockRequest({ Authorization: "" });

    await authh(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 when token is invalid", async () => {
    req = mockRequest({ Authorization: "Bearer invalid-token-here" });

    await authh(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Session expired or invalid token.",
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 when token is expired", async () => {
    // Create an expired token
    const expiredToken = jwt.sign({ id: "user123" }, JWT_SECRET, {
      expiresIn: "-1s",
    });
    req = mockRequest({ Authorization: `Bearer ${expiredToken}` });

    await authh(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Session expired or invalid token.",
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 when user is not found in database", async () => {
    const validToken = jwt.sign({ id: "user123" }, JWT_SECRET, {
      expiresIn: "1h",
    });
    req = mockRequest({ Authorization: `Bearer ${validToken}` });
    User.findById.mockResolvedValue(null);

    await authh(req, res, next);

    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "User not found. Invalid token.",
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("should call next() and attach user to req when token and user are valid", async () => {
    const mockUser = {
      _id: "user123",
      username: "testuser",
      email: "test@example.com",
    };
    const validToken = jwt.sign({ id: "user123" }, JWT_SECRET, {
      expiresIn: "1h",
    });
    req = mockRequest({ Authorization: `Bearer ${validToken}` });
    User.findById.mockResolvedValue(mockUser);

    await authh(req, res, next);

    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("should handle token with 'Bearer ' prefix correctly", async () => {
    const mockUser = { _id: "user456", username: "user456" };
    const validToken = jwt.sign({ id: "user456" }, JWT_SECRET, {
      expiresIn: "1h",
    });
    req = mockRequest({ Authorization: `Bearer ${validToken}` });
    User.findById.mockResolvedValue(mockUser);

    await authh(req, res, next);

    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });

  test("should return 401 when User.findById throws an error", async () => {
    const validToken = jwt.sign({ id: "user123" }, JWT_SECRET, {
      expiresIn: "1h",
    });
    req = mockRequest({ Authorization: `Bearer ${validToken}` });
    User.findById.mockRejectedValue(new Error("Database error"));

    await authh(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Session expired or invalid token.",
      })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
