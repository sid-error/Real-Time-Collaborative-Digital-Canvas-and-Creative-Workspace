/**
 * @fileoverview Unit tests for Mongoose model schemas (User, Room, Participant, Notification, Invitation).
 * These tests validate schema structure, required fields, defaults, and enums WITHOUT connecting to MongoDB.
 */

const mongoose = require("mongoose");

// Import all models
const User = require("../../models/User");
const Room = require("../../models/Room");
const Participant = require("../../models/Participant");
const Notification = require("../../models/Notification");
const Invitation = require("../../models/Invitation");

describe("User Model Schema", () => {
  test("should have the correct schema fields", () => {
    const schemaPaths = User.schema.paths;
    expect(schemaPaths.displayName).toBeDefined();
    expect(schemaPaths.username).toBeDefined();
    expect(schemaPaths.email).toBeDefined();
    expect(schemaPaths.password).toBeDefined();
    expect(schemaPaths.avatar).toBeDefined();
    expect(schemaPaths.bio).toBeDefined();
    expect(schemaPaths.isVerified).toBeDefined();
    expect(schemaPaths.verificationToken).toBeDefined();
    expect(schemaPaths.verificationTokenExpires).toBeDefined();
    expect(schemaPaths.resetPasswordToken).toBeDefined();
    expect(schemaPaths.resetPasswordExpires).toBeDefined();
    expect(schemaPaths.createdAt).toBeDefined();
  });

  test("should require displayName, username, email, and password", () => {
    const requiredFields = ["displayName", "username", "email", "password"];
    requiredFields.forEach((field) => {
      expect(User.schema.paths[field].isRequired).toBeTruthy();
    });
  });

  test("should have unique constraint on username and email", () => {
    expect(User.schema.paths.username.options.unique).toBe(true);
    expect(User.schema.paths.email.options.unique).toBe(true);
  });

  test("should default isVerified to false", () => {
    expect(User.schema.paths.isVerified.options.default).toBe(false);
  });

  test("should default avatar to null", () => {
    expect(User.schema.paths.avatar.options.default).toBeNull();
  });

  test("should enforce maxLength on bio (500)", () => {
    expect(User.schema.paths.bio.options.maxLength).toBe(500);
  });

  test("should store username and email in lowercase", () => {
    expect(User.schema.paths.username.options.lowercase).toBe(true);
    expect(User.schema.paths.email.options.lowercase).toBe(true);
  });

  test("should trim displayName, username, and email", () => {
    expect(User.schema.paths.displayName.options.trim).toBe(true);
    expect(User.schema.paths.username.options.trim).toBe(true);
    expect(User.schema.paths.email.options.trim).toBe(true);
  });

  test("should have loginActivities as a subdocument array", () => {
    const loginActivities = User.schema.paths.loginActivities;
    expect(loginActivities).toBeDefined();
  });

  test("should validate loginActivities status enum", () => {
    const statusPath = User.schema.path("loginActivities.status");
    expect(statusPath.options.enum).toEqual(["success", "failed"]);
  });

  test("should validate user document fails without required fields", () => {
    const user = new User({});
    const validationError = user.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError.errors.displayName).toBeDefined();
    expect(validationError.errors.username).toBeDefined();
    expect(validationError.errors.email).toBeDefined();
    expect(validationError.errors.password).toBeDefined();
  });

  test("should validate user document passes with all required fields", () => {
    const user = new User({
      displayName: "Test User",
      username: "testuser",
      email: "test@example.com",
      password: "hashedpassword123",
    });
    const validationError = user.validateSync();
    expect(validationError).toBeUndefined();
  });
});

describe("Room Model Schema", () => {
  test("should have the correct schema fields", () => {
    const schemaPaths = Room.schema.paths;
    expect(schemaPaths.name).toBeDefined();
    expect(schemaPaths.description).toBeDefined();
    expect(schemaPaths.roomCode).toBeDefined();
    expect(schemaPaths.visibility).toBeDefined();
    expect(schemaPaths.password).toBeDefined();
    expect(schemaPaths.owner).toBeDefined();
    expect(schemaPaths.isActive).toBeDefined();
    expect(schemaPaths.drawingData).toBeDefined();
    expect(schemaPaths.createdAt).toBeDefined();
    expect(schemaPaths.updatedAt).toBeDefined();
  });

  test("should require name, roomCode, and owner", () => {
    expect(Room.schema.paths.name.isRequired).toBeTruthy();
    expect(Room.schema.paths.roomCode.isRequired).toBeTruthy();
    expect(Room.schema.paths.owner.isRequired).toBeTruthy();
  });

  test("should have unique constraint on roomCode", () => {
    expect(Room.schema.paths.roomCode.options.unique).toBe(true);
  });

  test("should default visibility to 'public'", () => {
    expect(Room.schema.paths.visibility.options.default).toBe("public");
  });

  test("should enforce visibility enum ['public', 'private']", () => {
    expect(Room.schema.paths.visibility.options.enum).toEqual([
      "public",
      "private",
    ]);
  });

  test("should default isActive to true", () => {
    expect(Room.schema.paths.isActive.options.default).toBe(true);
  });

  test("should default drawingData to empty array", () => {
    const room = new Room({
      name: "Test Room",
      roomCode: "ABCD",
      owner: new mongoose.Types.ObjectId(),
    });
    expect(room.drawingData).toEqual([]);
  });

  test("should enforce maxlength on name (100) and description (500)", () => {
    expect(Room.schema.paths.name.options.maxlength).toBe(100);
    expect(Room.schema.paths.description.options.maxlength).toBe(500);
  });

  test("should have a comparePassword method", () => {
    const room = new Room({
      name: "Test Room",
      roomCode: "ABCD",
      owner: new mongoose.Types.ObjectId(),
    });
    expect(typeof room.comparePassword).toBe("function");
  });

  test("should store roomCode as uppercase", () => {
    expect(Room.schema.paths.roomCode.options.uppercase).toBe(true);
  });

  test("should reference User model for owner", () => {
    expect(Room.schema.paths.owner.options.ref).toBe("User");
  });

  test("should reference Participant model for participants", () => {
    const participantsSchema = Room.schema.path("participants");
    expect(participantsSchema).toBeDefined();
  });
});

describe("Participant Model Schema", () => {
  test("should have the correct schema fields", () => {
    const schemaPaths = Participant.schema.paths;
    expect(schemaPaths.user).toBeDefined();
    expect(schemaPaths.room).toBeDefined();
    expect(schemaPaths.role).toBeDefined();
    expect(schemaPaths.isBanned).toBeDefined();
    expect(schemaPaths.joinedAt).toBeDefined();
    expect(schemaPaths.lastSeen).toBeDefined();
  });

  test("should require user and room", () => {
    expect(Participant.schema.paths.user.isRequired).toBeTruthy();
    expect(Participant.schema.paths.room.isRequired).toBeTruthy();
  });

  test("should default role to 'participant'", () => {
    expect(Participant.schema.paths.role.options.default).toBe("participant");
  });

  test("should enforce role enum ['owner', 'moderator', 'participant']", () => {
    expect(Participant.schema.paths.role.options.enum).toEqual([
      "owner",
      "moderator",
      "participant",
    ]);
  });

  test("should default isBanned to false", () => {
    expect(Participant.schema.paths.isBanned.options.default).toBe(false);
  });

  test("should reference User and Room models", () => {
    expect(Participant.schema.paths.user.options.ref).toBe("User");
    expect(Participant.schema.paths.room.options.ref).toBe("Room");
  });

  test("should validate participant fails without required fields", () => {
    const participant = new Participant({});
    const validationError = participant.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError.errors.user).toBeDefined();
    expect(validationError.errors.room).toBeDefined();
  });

  test("should validate participant passes with required fields", () => {
    const participant = new Participant({
      user: new mongoose.Types.ObjectId(),
      room: new mongoose.Types.ObjectId(),
    });
    const validationError = participant.validateSync();
    expect(validationError).toBeUndefined();
  });

  test("should reject invalid role values", () => {
    const participant = new Participant({
      user: new mongoose.Types.ObjectId(),
      room: new mongoose.Types.ObjectId(),
      role: "superadmin",
    });
    const validationError = participant.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError.errors.role).toBeDefined();
  });
});

describe("Notification Model Schema", () => {
  test("should have the correct schema fields", () => {
    const schemaPaths = Notification.schema.paths;
    expect(schemaPaths.recipient).toBeDefined();
    expect(schemaPaths.type).toBeDefined();
    expect(schemaPaths.title).toBeDefined();
    expect(schemaPaths.message).toBeDefined();
    expect(schemaPaths.isRead).toBeDefined();
    expect(schemaPaths.relatedUser).toBeDefined();
    expect(schemaPaths.relatedRoom).toBeDefined();
    expect(schemaPaths.actionUrl).toBeDefined();
    expect(schemaPaths.createdAt).toBeDefined();
    expect(schemaPaths.readAt).toBeDefined();
  });

  test("should require recipient, type, title, and message", () => {
    expect(Notification.schema.paths.recipient.isRequired).toBeTruthy();
    expect(Notification.schema.paths.type.isRequired).toBeTruthy();
    expect(Notification.schema.paths.title.isRequired).toBeTruthy();
    expect(Notification.schema.paths.message.isRequired).toBeTruthy();
  });

  test("should enforce type enum values", () => {
    const typeEnum = Notification.schema.paths.type.options.enum;
    expect(typeEnum).toContain("user_invited_to_room");
    expect(typeEnum).toContain("room_joined");
    expect(typeEnum).toContain("participant_promoted");
    expect(typeEnum).toContain("participant_demoted");
    expect(typeEnum).toContain("participant_kicked");
    expect(typeEnum).toContain("participant_banned");
    expect(typeEnum).toContain("room_updated");
    expect(typeEnum).toContain("comment_mentioned");
    expect(typeEnum).toContain("drawing_shared");
  });

  test("should default isRead to false", () => {
    expect(Notification.schema.paths.isRead.options.default).toBe(false);
  });

  test("should default readAt to null", () => {
    expect(Notification.schema.paths.readAt.options.default).toBeNull();
  });

  test("should have TTL (expires) on createdAt", () => {
    expect(Notification.schema.paths.createdAt.options.expires).toBe(2592000);
  });

  test("should reference User and Room models", () => {
    expect(Notification.schema.paths.recipient.options.ref).toBe("User");
    expect(Notification.schema.paths.relatedUser.options.ref).toBe("User");
    expect(Notification.schema.paths.relatedRoom.options.ref).toBe("Room");
  });

  test("should validate notification fails without required fields", () => {
    const notification = new Notification({});
    const validationError = notification.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError.errors.recipient).toBeDefined();
    expect(validationError.errors.type).toBeDefined();
    expect(validationError.errors.title).toBeDefined();
    expect(validationError.errors.message).toBeDefined();
  });

  test("should reject invalid notification type", () => {
    const notification = new Notification({
      recipient: new mongoose.Types.ObjectId(),
      type: "invalid_type",
      title: "Test",
      message: "Test message",
    });
    const validationError = notification.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError.errors.type).toBeDefined();
  });
});

describe("Invitation Model Schema", () => {
  test("should have the correct schema fields", () => {
    const schemaPaths = Invitation.schema.paths;
    expect(schemaPaths.room).toBeDefined();
    expect(schemaPaths.invitedUser).toBeDefined();
    expect(schemaPaths.invitedBy).toBeDefined();
    expect(schemaPaths.status).toBeDefined();
    expect(schemaPaths.emailSent).toBeDefined();
    expect(schemaPaths.createdAt).toBeDefined();
    expect(schemaPaths.acceptedAt).toBeDefined();
  });

  test("should require room, invitedUser, and invitedBy", () => {
    expect(Invitation.schema.paths.room.isRequired).toBeTruthy();
    expect(Invitation.schema.paths.invitedUser.isRequired).toBeTruthy();
    expect(Invitation.schema.paths.invitedBy.isRequired).toBeTruthy();
  });

  test("should default status to 'pending'", () => {
    expect(Invitation.schema.paths.status.options.default).toBe("pending");
  });

  test("should enforce status enum values", () => {
    expect(Invitation.schema.paths.status.options.enum).toEqual([
      "pending",
      "accepted",
      "rejected",
      "expired",
    ]);
  });

  test("should default emailSent to false", () => {
    expect(Invitation.schema.paths.emailSent.options.default).toBe(false);
  });

  test("should default acceptedAt to null", () => {
    expect(Invitation.schema.paths.acceptedAt.options.default).toBeNull();
  });

  test("should have TTL (expires) on createdAt", () => {
    expect(Invitation.schema.paths.createdAt.options.expires).toBe(2592000);
  });

  test("should reference correct models", () => {
    expect(Invitation.schema.paths.room.options.ref).toBe("Room");
    expect(Invitation.schema.paths.invitedUser.options.ref).toBe("User");
    expect(Invitation.schema.paths.invitedBy.options.ref).toBe("User");
  });

  test("should validate invitation fails without required fields", () => {
    const invitation = new Invitation({});
    const validationError = invitation.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError.errors.room).toBeDefined();
    expect(validationError.errors.invitedUser).toBeDefined();
    expect(validationError.errors.invitedBy).toBeDefined();
  });

  test("should reject invalid status values", () => {
    const invitation = new Invitation({
      room: new mongoose.Types.ObjectId(),
      invitedUser: new mongoose.Types.ObjectId(),
      invitedBy: new mongoose.Types.ObjectId(),
      status: "unknown",
    });
    const validationError = invitation.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError.errors.status).toBeDefined();
  });
});
