/**
 * @fileoverview Unit tests for the database configuration module.
 */

describe("connectDB", () => {
  let originalExit;
  let originalSetTimeout;
  let mockConnect;

  beforeAll(() => {
    // Prevent process.exit from actually terminating the test
    originalExit = process.exit;
    process.exit = jest.fn();

    // Speed up setTimeout to avoid real 5s delays in retry logic
    originalSetTimeout = global.setTimeout;
    global.setTimeout = (fn, _ms) => originalSetTimeout(fn, 0);
  });

  afterAll(() => {
    process.exit = originalExit;
    global.setTimeout = originalSetTimeout;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env.MONGO_URI = "mongodb://localhost:27017/testdb";

    // Create the mock for mongoose.connect
    mockConnect = jest.fn();
    jest.mock("mongoose", () => ({
      connect: mockConnect,
    }));

    // Suppress console logs during tests
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should connect to MongoDB successfully on first attempt", async () => {
    mockConnect.mockResolvedValue(true);

    const connectDB = require("../../config/database");
    await connectDB();

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockConnect).toHaveBeenCalledWith(process.env.MONGO_URI);
  });

  test("should retry on connection failure and succeed on second attempt", async () => {
    mockConnect
      .mockRejectedValueOnce(new Error("Connection refused"))
      .mockResolvedValueOnce(true);

    const connectDB = require("../../config/database");
    await connectDB();

    expect(mockConnect).toHaveBeenCalledTimes(2);
  });

  test("should call process.exit(1) after max retries exceeded", async () => {
    mockConnect.mockRejectedValue(new Error("Connection refused"));

    const connectDB = require("../../config/database");
    await connectDB();

    expect(mockConnect).toHaveBeenCalledTimes(5);
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  test("should use MONGO_URI from environment variables", async () => {
    process.env.MONGO_URI = "mongodb://custom-host:27017/customdb";
    mockConnect.mockResolvedValue(true);

    const connectDB = require("../../config/database");
    await connectDB();

    expect(mockConnect).toHaveBeenCalledWith("mongodb://custom-host:27017/customdb");
  });
});
