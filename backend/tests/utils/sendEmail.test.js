/**
 * @fileoverview Unit tests for the sendEmail utility.
 */

// Mock https module for Resend API tests
jest.mock("https", () => {
  const EventEmitter = require("events");
  return {
    request: jest.fn(),
  };
});

// Mock nodemailer for SMTP fallback tests
jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}));

const https = require("https");
const nodemailer = require("nodemailer");

// We need to load sendEmail after setting env vars or mocks
let sendEmail;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("sendEmail utility", () => {
  describe("Resend API path", () => {
    beforeEach(() => {
      process.env.RESEND_API_KEY = "test-api-key";
      // Re-require https mock
      jest.resetModules();
      // Re-mock
      jest.mock("https", () => {
        const EventEmitter = require("events");
        return {
          request: jest.fn(),
        };
      });
      jest.mock("nodemailer", () => ({
        createTransport: jest.fn().mockReturnValue({
          sendMail: jest.fn(),
        }),
      }));
    });

    afterEach(() => {
      delete process.env.RESEND_API_KEY;
    });

    test("should use Resend API when RESEND_API_KEY is set", async () => {
      const httpsModule = require("https");
      const EventEmitter = require("events");

      // Create a mock response
      const mockRes = new EventEmitter();
      mockRes.statusCode = 200;

      // Create a mock request
      const mockReq = new EventEmitter();
      mockReq.write = jest.fn();
      mockReq.end = jest.fn();

      httpsModule.request.mockImplementation((options, callback) => {
        // Simulate async response
        setTimeout(() => {
          callback(mockRes);
          mockRes.emit("data", '{"id":"test-id"}');
          mockRes.emit("end");
        }, 10);
        return mockReq;
      });

      const sendEmailFn = require("../../utils/sendEmail");

      await sendEmailFn({
        email: "test@example.com",
        subject: "Test Subject",
        verificationUrl: "http://localhost:3000/verify?token=abc",
      });

      expect(httpsModule.request).toHaveBeenCalledWith(
        expect.objectContaining({
          hostname: "api.resend.com",
          path: "/emails",
          method: "POST",
        }),
        expect.any(Function)
      );
    });

    test("should reject when Resend API returns error status", async () => {
      const httpsModule = require("https");
      const EventEmitter = require("events");

      const mockRes = new EventEmitter();
      mockRes.statusCode = 400;

      const mockReq = new EventEmitter();
      mockReq.write = jest.fn();
      mockReq.end = jest.fn();

      httpsModule.request.mockImplementation((options, callback) => {
        setTimeout(() => {
          callback(mockRes);
          mockRes.emit("data", '{"error":"Bad Request"}');
          mockRes.emit("end");
        }, 10);
        return mockReq;
      });

      const sendEmailFn = require("../../utils/sendEmail");

      await expect(
        sendEmailFn({
          email: "test@example.com",
          subject: "Test Subject",
          verificationUrl: "http://localhost:3000/verify?token=abc",
        })
      ).rejects.toThrow("Resend API error");
    });
  });

  describe("SMTP fallback path", () => {
    beforeEach(() => {
      delete process.env.RESEND_API_KEY;
      process.env.EMAIL_USER = "testuser@gmail.com";
      process.env.EMAIL_PASS = "testpass";
    });

    afterEach(() => {
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASS;
    });

    test("should use SMTP when no RESEND_API_KEY is set", async () => {
      const nodemailerModule = require("nodemailer");
      const mockSendMail = jest.fn().mockResolvedValue({ messageId: "test-id" });
      nodemailerModule.createTransport.mockReturnValue({
        sendMail: mockSendMail,
      });

      const sendEmailFn = require("../../utils/sendEmail");

      await sendEmailFn({
        email: "test@example.com",
        subject: "Test Subject",
        verificationUrl: "http://localhost:3000/verify?token=abc",
      });

      expect(nodemailerModule.createTransport).toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: "Test Subject",
        })
      );
    });

    test("should throw error when SMTP send fails", async () => {
      const nodemailerModule = require("nodemailer");
      const mockSendMail = jest.fn().mockRejectedValue(new Error("SMTP connection failed"));
      nodemailerModule.createTransport.mockReturnValue({
        sendMail: mockSendMail,
      });

      const sendEmailFn = require("../../utils/sendEmail");

      await expect(
        sendEmailFn({
          email: "test@example.com",
          subject: "Test Subject",
          resetUrl: "http://localhost:3000/reset?token=abc",
        })
      ).rejects.toThrow("SMTP connection failed");
    });
  });
});
