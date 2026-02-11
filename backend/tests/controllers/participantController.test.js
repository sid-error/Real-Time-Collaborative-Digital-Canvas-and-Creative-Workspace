/**
 * @fileoverview Unit tests for the participantController.
 */

const mongoose = require("mongoose");

jest.mock("../../models/Participant");
jest.mock("../../models/Room");
jest.mock("../../models/User");

const Participant = require("../../models/Participant");
const Room = require("../../models/Room");

const {
  getRoomParticipants,
  assignRole,
  kickParticipant,
  banParticipant,
  unbanParticipant,
  searchParticipants,
} = require("../../controllers/participantController");

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

// ─── getRoomParticipants ─────────────────────────────────────────────────────

describe("getRoomParticipants", () => {
  test("should return 403 when user is not a room member", async () => {
    Participant.findOne.mockResolvedValue(null);

    const req = mockRequest({}, { roomId: "room-id" });
    const res = mockResponse();

    await getRoomParticipants(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Not authorized for this room" })
    );
  });

  test("should return participants list", async () => {
    Participant.findOne.mockResolvedValue({ _id: "p1" });

    const mockParticipants = [
      { _id: "p1", user: { username: "user1", email: "u1@e.com" }, role: "owner" },
      { _id: "p2", user: { username: "user2", email: "u2@e.com" }, role: "participant" },
    ];

    Participant.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockParticipants),
      }),
    });

    const req = mockRequest({}, { roomId: "room-id" });
    const res = mockResponse();

    await getRoomParticipants(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        participants: mockParticipants,
        count: 2,
      })
    );
  });

  test("should return 400 on database error", async () => {
    Participant.findOne.mockRejectedValue(new Error("DB error"));

    const req = mockRequest({}, { roomId: "room-id" });
    const res = mockResponse();

    await getRoomParticipants(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ─── assignRole ──────────────────────────────────────────────────────────────

describe("assignRole", () => {
  test("should return 403 when requester is not the room owner", async () => {
    const otherUserId = new mongoose.Types.ObjectId();
    const mockRoom = {
      owner: { _id: otherUserId },
    };

    Room.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockRoom),
    });

    const req = mockRequest(
      { role: "moderator" },
      { roomId: "room-id", participantId: "p-id" }
    );
    const res = mockResponse();

    await assignRole(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Only room owner can assign roles",
      })
    );
  });

  test("should assign role successfully", async () => {
    const userId = new mongoose.Types.ObjectId();

    Room.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        owner: { _id: userId },
      }),
    });

    const updatedParticipant = {
      _id: "p-id",
      user: { username: "testuser" },
      role: "moderator",
    };

    Participant.findOneAndUpdate.mockReturnValue({
      populate: jest.fn().mockResolvedValue(updatedParticipant),
    });

    const req = mockRequest(
      { role: "moderator" },
      { roomId: "room-id", participantId: "p-id" },
      {},
      { _id: userId }
    );
    const res = mockResponse();

    await assignRole(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        participant: expect.objectContaining({
          role: "moderator",
        }),
      })
    );
  });

  test("should return 403 when room not found", async () => {
    Room.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const req = mockRequest(
      { role: "moderator" },
      { roomId: "room-id", participantId: "p-id" }
    );
    const res = mockResponse();

    await assignRole(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ─── kickParticipant ─────────────────────────────────────────────────────────

describe("kickParticipant", () => {
  test("should return 403 when requester has no kick permissions", async () => {
    Participant.findOne.mockResolvedValue({ role: "participant" });

    const req = mockRequest({}, { roomId: "room-id", participantId: "p-id" });
    const res = mockResponse();

    await kickParticipant(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Not authorized to kick participants",
      })
    );
  });

  test("should return 403 when requester is not a room member", async () => {
    Participant.findOne.mockResolvedValue(null);

    const req = mockRequest({}, { roomId: "room-id", participantId: "p-id" });
    const res = mockResponse();

    await kickParticipant(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("should return 400 when trying to kick self", async () => {
    const userId = new mongoose.Types.ObjectId();
    Participant.findOne.mockResolvedValue({ role: "owner" });
    Participant.findById.mockResolvedValue({ user: userId });

    const req = mockRequest(
      {},
      { roomId: "room-id", participantId: "p-id" },
      {},
      { _id: userId }
    );
    const res = mockResponse();

    await kickParticipant(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Cannot kick room owner" })
    );
  });

  test("should kick participant successfully", async () => {
    const userId = new mongoose.Types.ObjectId();
    const otherUserId = new mongoose.Types.ObjectId();

    Participant.findOne.mockResolvedValue({ role: "owner" });
    Participant.findById.mockResolvedValue({ user: otherUserId });
    Room.findByIdAndUpdate.mockResolvedValue(true);
    Participant.findByIdAndDelete.mockResolvedValue(true);

    const req = mockRequest(
      {},
      { roomId: "room-id", participantId: "p-id" },
      {},
      { _id: userId }
    );
    const res = mockResponse();

    await kickParticipant(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Participant kicked successfully",
      })
    );
  });
});

// ─── banParticipant ──────────────────────────────────────────────────────────

describe("banParticipant", () => {
  test("should return 403 when requester has no ban permissions", async () => {
    Participant.findOne.mockResolvedValue({ role: "participant" });

    const req = mockRequest({}, { roomId: "room-id", participantId: "p-id" });
    const res = mockResponse();

    await banParticipant(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("should ban participant successfully", async () => {
    Participant.findOne.mockResolvedValue({ role: "owner" });
    Participant.findOneAndUpdate.mockResolvedValue({ isBanned: true });

    const req = mockRequest({}, { roomId: "room-id", participantId: "p-id" });
    const res = mockResponse();

    await banParticipant(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Participant banned",
      })
    );
  });

  test("should return 400 on error", async () => {
    Participant.findOne.mockRejectedValue(new Error("DB error"));

    const req = mockRequest({}, { roomId: "room-id", participantId: "p-id" });
    const res = mockResponse();

    await banParticipant(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ─── unbanParticipant ────────────────────────────────────────────────────────

describe("unbanParticipant", () => {
  test("should return 403 when requester is not the owner", async () => {
    const otherUserId = new mongoose.Types.ObjectId();
    Room.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        owner: { _id: otherUserId },
      }),
    });

    const req = mockRequest({}, { roomId: "room-id", participantId: "p-id" });
    const res = mockResponse();

    await unbanParticipant(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Only room owner can unban" })
    );
  });

  test("should unban participant successfully", async () => {
    const userId = new mongoose.Types.ObjectId();

    Room.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        owner: { _id: userId },
      }),
    });
    Participant.findOneAndUpdate.mockResolvedValue({ isBanned: false });

    const req = mockRequest(
      {},
      { roomId: "room-id", participantId: "p-id" },
      {},
      { _id: userId }
    );
    const res = mockResponse();

    await unbanParticipant(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Participant unbanned",
      })
    );
  });
});

// ─── searchParticipants ──────────────────────────────────────────────────────

describe("searchParticipants", () => {
  test("should return filtered participants", async () => {
    Participant.findOne.mockResolvedValue({ _id: "p1" });

    const mockParticipants = [
      { _id: "p1", user: { username: "alice" }, role: "owner" },
    ];

    Participant.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockParticipants),
      }),
    });

    const req = mockRequest(
      {},
      { roomId: "room-id" },
      { query: "alice", role: "owner" }
    );
    const res = mockResponse();

    await searchParticipants(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        participants: mockParticipants,
      })
    );
  });

  test("should search without query/role filters", async () => {
    Participant.findOne.mockResolvedValue({ _id: "p1" });
    Participant.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      }),
    });

    const req = mockRequest({}, { roomId: "room-id" }, {});
    const res = mockResponse();

    await searchParticipants(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ participants: [] })
    );
  });

  test("should return 400 on error", async () => {
    Participant.findOne.mockRejectedValue(new Error("DB error"));

    const req = mockRequest({}, { roomId: "room-id" });
    const res = mockResponse();

    await searchParticipants(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
