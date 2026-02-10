/**
 * @fileoverview Invitation model schema definition.
 */

// Import the mongoose library for schema creation
const mongoose = require("mongoose");

/**
 * Mongoose schema for room invitations.
 * 
 * @typedef {Object} Invitation
 * @property {mongoose.Types.ObjectId} room - The room the user is invited to.
 * @property {mongoose.Types.ObjectId} invitedUser - The user being invited.
 * @property {mongoose.Types.ObjectId} invitedBy - The user who sent the invitation.
 * @property {string} status - The status of the invitation ("pending", "accepted", "rejected", or "expired").
 * @property {boolean} emailSent - Whether an invitation email was sent.
 * @property {Date} createdAt - Timestamp when the invitation was created (expires in 30 days).
 * @property {Date|null} acceptedAt - Timestamp when the invitation was accepted.
 */
const invitationSchema = new mongoose.Schema({
  // Reference to the room the recipient is invited to join
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  // Reference to the user who is receiving the invitation
  invitedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Reference to the user who triggered the invitation process
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Current state of the invitation (initial status is pending)
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "expired"],
    default: "pending",
  },
  // Flag to keep track of successful SMTP delivery for the invite
  emailSent: {
    type: Boolean,
    default: false,
  },
  // Auto-populated creation timestamp; expires after 30 days (2592000 seconds)
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000, 
  },
  // Timestamp recorded only if/when the user accepts the invite
  acceptedAt: {
    type: Date,
    default: null,
  },
});

// Compile and export the 'Invitation' model for database interaction
module.exports = mongoose.model("Invitation", invitationSchema);


