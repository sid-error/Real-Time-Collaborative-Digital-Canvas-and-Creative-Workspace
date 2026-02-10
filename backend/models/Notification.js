/**
 * @fileoverview Notification model schema definition.
 */

// Import the mongoose library to create the notification schema
const mongoose = require("mongoose");

/**
 * Mongoose schema for user notifications.
 * 
 * @typedef {Object} Notification
 * @property {mongoose.Types.ObjectId} recipient - The user receiving the notification.
 * @property {string} type - The type of notification (e.g., "user_invited_to_room", "room_joined").
 * @property {string} title - The title of the notification.
 * @property {string} message - Detailed notification message.
 * @property {boolean} isRead - Whether the notification has been read.
 * @property {mongoose.Types.ObjectId} [relatedUser] - Another user associated with this notification.
 * @property {mongoose.Types.ObjectId} [relatedRoom] - A room associated with this notification.
 * @property {string} [actionUrl] - Optional URL for the user to take action.
 * @property {Date} createdAt - Timestamp when the notification was created (expires in 30 days).
 * @property {Date|null} readAt - Timestamp when the notification was read.
 */
const notificationSchema = new mongoose.Schema({
  // The user account that will receive this notification in their feed
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Categorization to help the frontend decide how to display or group the notification
  type: {
    type: String,
    enum: [
      "user_invited_to_room",
      "room_joined",
      "participant_promoted",
      "participant_demoted",
      "participant_kicked",
      "participant_banned",
      "room_updated",
      "comment_mentioned",
      "drawing_shared",
    ],
    required: true,
  },
  // High-level summary text for the notification
  title: {
    type: String,
    required: true,
  },
  // Detailed explanation or description of the event
  message: {
    type: String,
    required: true,
  },
  // Boolean flag to track the read status of the notification
  isRead: {
    type: Boolean,
    default: false,
  },
  // Optional reference to another user involved (e.g., the inviter)
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // Optional reference to a specific room relevant to the event
  relatedRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
  },
  // Optional link used by the frontend to navigate the user to a specific page
  actionUrl: {
    type: String,
  },
  // Auto-populated creation timestamp; expires after 30 days (2592000 seconds)
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000, 
  },
  // Timestamp recorded specifically when the user opens/reads the notification
  readAt: {
    type: Date,
    default: null,
  },
});

// Index to optimize fetching unread notifications by recipient sorted by recent date
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
// Index to optimize general fetching of all notifications for a recipient
notificationSchema.index({ recipient: 1, createdAt: -1 });

// Export the 'Notification' model
module.exports = mongoose.model("Notification", notificationSchema);


