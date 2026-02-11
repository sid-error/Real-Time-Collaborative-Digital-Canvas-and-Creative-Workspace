/**
 * @fileoverview Unit tests for the notificationController.
 */

const mongoose = require("mongoose");

jest.mock("../../models/Notification");
jest.mock("../../models/User");

const Notification = require("../../models/Notification");
const {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
} = require("../../controllers/notificationController");

// Helpers
const mockRequest = (body = {}, params = {}, query = {}, user = {}) => ({
  body,
  params,
  query,
  user: { _id: new mongoose.Types.ObjectId(), ...user },
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── getNotifications ────────────────────────────────────────────────────────

describe("getNotifications", () => {
  test("should return notifications with pagination", async () => {
    const mockNotifications = [
      { _id: "1", title: "Invite", isRead: false },
      { _id: "2", title: "Update", isRead: true },
    ];

    Notification.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              skip: jest.fn().mockResolvedValue(mockNotifications),
            }),
          }),
        }),
      }),
    });
    Notification.countDocuments.mockResolvedValue(2);

    const req = mockRequest({}, {}, { page: 1, limit: 20 });
    const res = mockResponse();

    await getNotifications(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        notifications: mockNotifications,
        pagination: expect.objectContaining({
          page: 1,
          limit: 20,
          total: 2,
        }),
      })
    );
  });

  test("should filter by unread when unreadOnly is 'true'", async () => {
    Notification.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              skip: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
    });
    Notification.countDocuments.mockResolvedValue(0);

    const userId = new mongoose.Types.ObjectId();
    const req = mockRequest({}, {}, { unreadOnly: "true" }, { _id: userId });
    const res = mockResponse();

    await getNotifications(req, res);

    expect(Notification.find).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: userId,
        isRead: false,
      })
    );
  });

  test("should return 500 on database error", async () => {
    Notification.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              skip: jest.fn().mockRejectedValue(new Error("DB error")),
            }),
          }),
        }),
      }),
    });

    const req = mockRequest();
    const res = mockResponse();

    await getNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Failed to fetch notifications",
      })
    );
  });
});

// ─── getUnreadCount ──────────────────────────────────────────────────────────

describe("getUnreadCount", () => {
  test("should return unread count", async () => {
    Notification.countDocuments.mockResolvedValue(5);

    const req = mockRequest();
    const res = mockResponse();

    await getUnreadCount(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        unreadCount: 5,
      })
    );
  });

  test("should return 0 when no unread notifications", async () => {
    Notification.countDocuments.mockResolvedValue(0);

    const req = mockRequest();
    const res = mockResponse();

    await getUnreadCount(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        unreadCount: 0,
      })
    );
  });

  test("should return 500 on error", async () => {
    Notification.countDocuments.mockRejectedValue(new Error("DB error"));

    const req = mockRequest();
    const res = mockResponse();

    await getUnreadCount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── markNotificationAsRead ──────────────────────────────────────────────────

describe("markNotificationAsRead", () => {
  test("should mark notification as read", async () => {
    const mockNotification = {
      _id: "notif-1",
      isRead: true,
      readAt: new Date(),
    };

    Notification.findOneAndUpdate.mockResolvedValue(mockNotification);

    const req = mockRequest({}, { id: "notif-1" });
    const res = mockResponse();

    await markNotificationAsRead(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Notification marked as read",
        notification: mockNotification,
      })
    );
  });

  test("should return 404 when notification not found", async () => {
    Notification.findOneAndUpdate.mockResolvedValue(null);

    const req = mockRequest({}, { id: "nonexistent" });
    const res = mockResponse();

    await markNotificationAsRead(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Notification not found",
      })
    );
  });

  test("should return 500 on database error", async () => {
    Notification.findOneAndUpdate.mockRejectedValue(new Error("DB error"));

    const req = mockRequest({}, { id: "notif-1" });
    const res = mockResponse();

    await markNotificationAsRead(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── markAllAsRead ───────────────────────────────────────────────────────────

describe("markAllAsRead", () => {
  test("should mark all notifications as read", async () => {
    Notification.updateMany.mockResolvedValue({ modifiedCount: 3 });

    const req = mockRequest();
    const res = mockResponse();

    await markAllAsRead(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "All notifications marked as read",
        modifiedCount: 3,
      })
    );
  });

  test("should return 500 on error", async () => {
    Notification.updateMany.mockRejectedValue(new Error("DB error"));

    const req = mockRequest();
    const res = mockResponse();

    await markAllAsRead(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── deleteNotification ──────────────────────────────────────────────────────

describe("deleteNotification", () => {
  test("should delete notification successfully", async () => {
    Notification.findOneAndDelete.mockResolvedValue({ _id: "notif-1" });

    const req = mockRequest({}, { id: "notif-1" });
    const res = mockResponse();

    await deleteNotification(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Notification deleted",
      })
    );
  });

  test("should return 404 when notification not found", async () => {
    Notification.findOneAndDelete.mockResolvedValue(null);

    const req = mockRequest({}, { id: "nonexistent" });
    const res = mockResponse();

    await deleteNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Notification not found",
      })
    );
  });

  test("should return 500 on database error", async () => {
    Notification.findOneAndDelete.mockRejectedValue(new Error("DB error"));

    const req = mockRequest({}, { id: "notif-1" });
    const res = mockResponse();

    await deleteNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── createNotification (internal utility) ───────────────────────────────────

describe("createNotification (internal utility)", () => {
  test("should create and save a notification", async () => {
    const savedNotification = {
      _id: "new-notif",
      recipient: "user-id",
      type: "room_joined",
      title: "Room Joined",
      message: "You joined a room",
      save: jest.fn(),
    };
    Notification.mockImplementation(() => savedNotification);

    const result = await createNotification(
      "user-id",
      "room_joined",
      "Room Joined",
      "You joined a room",
      { relatedRoomId: "room-id" }
    );

    expect(savedNotification.save).toHaveBeenCalled();
    expect(result).toEqual(savedNotification);
  });

  test("should return null on error", async () => {
    Notification.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error("Save failed")),
    }));

    // Suppress console.error
    jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await createNotification(
      "user-id",
      "room_joined",
      "Test",
      "Test message"
    );

    expect(result).toBeNull();

    jest.restoreAllMocks();
  });
});
