/**
 * @fileoverview Participant model schema definition.
 */

// Import the mongoose library to define the connection between users and rooms
const mongoose = require("mongoose");

/**
 * Mongoose schema for room participants.
 * 
 * @typedef {Object} Participant
 * @property {mongoose.Types.ObjectId} user - The user participating in the room.
 * @property {mongoose.Types.ObjectId} room - The room the user is participating in.
 * @property {string} role - The user's role in the room ("owner", "moderator", or "participant").
 * @property {boolean} isBanned - Whether the user is banned from the room.
 * @property {Date} joinedAt - Timestamp when the user joined the room.
 * @property {Date} lastSeen - Timestamp when the user was last active in the room.
 */
const participantSchema = new mongoose.Schema({
  // Reference to the unique User ID; links the participant to a registered account
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Reference to the unique Room ID; identifies which session the user is part of
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  // Permission classification for the user within this specific room
  role: {
    type: String,
    enum: ["owner", "moderator", "participant"],
    default: "participant",
  },
  // Security flag to prevent banned users from reconnecting to the room
  isBanned: {
    type: Boolean,
    default: false,
  },
  // Timestamp recorded at the moment the user successfully joins the room
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  // Timestamp periodically updated to monitor user presence and activity
  lastSeen: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the 'Participant' model based on the schema
module.exports = mongoose.model("Participant", participantSchema);


