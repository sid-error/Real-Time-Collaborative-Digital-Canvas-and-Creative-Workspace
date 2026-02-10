/**
 * @fileoverview Socket.io handler for real-time user notifications.
 */

// Import the Notification model to persist events to the database
const Notification = require("../models/Notification");

/**
 * Main handler for notification-related socket events.
 * 
 * @function notificationSocketHandler
 * @param {import('socket.io').Server} io - Socket.io server instance.
 * @param {import('socket.io').Socket} socket - Socket instance for a specific client.
 */
const notificationSocketHandler = (io, socket) => {
  /**
   * Event: subscribe-notifications
   * Joins the user to their individual notification channel.
   */
  socket.on("subscribe-notifications", ({ userId }) => {
    // Generate a unique room string for this user and subscribe the socket to it
    socket.join(`user:${userId}:notifications`);
  });

  /**
   * Event: unsubscribe-notifications
   * Removes the user from their individual notification channel.
   */
  socket.on("unsubscribe-notifications", ({ userId }) => {
    // Leave the individual notification room when user signs out or navigates away
    socket.leave(`user:${userId}:notifications`);
  });

  /**
   * Event: send-notification
   * Receives notification data, persists it to the database, and broadcasts to the recipient.
   */
  socket.on("send-notification", async (data) => {
    try {
      // Destructure core notification fields from the incoming event payload
      const {
        recipientId,
        type,
        title,
        message,
        relatedUser,
        relatedRoom,
        actionUrl,
      } = data;

      // Create a new Notification document to store in MongoDB
      const notification = new Notification({
        recipient: recipientId,
        type,
        title,
        message,
        relatedUser,
        relatedRoom,
        actionUrl,
      });

      // Commit the notification record to the database
      await notification.save();

      // Retrieve the saved notification and populate foreign keys for display on the frontend
      const populatedNotification = await Notification.findById(
        notification._id,
      )
        // Attach basic user attributes (name/avatar) if a related user exists
        .populate("relatedUser", "username avatar")
        // Attach basic room attributes (name/code) if a related room exists
        .populate("relatedRoom", "name roomCode");

      // Transmit the new notification in real-time to the recipient's private channel
      io.to(`user:${recipientId}:notifications`).emit("new-notification", {
        notification: populatedNotification,
      });
    } catch (error) {
      // Log errors if database persistence or broadcasting fails
      console.error("Error sending notification:", error);
    }
  });

  // Handle socket disconnection event
  socket.on("disconnect", () => {
    // Cleanup of room subscriptions is managed internally by socket.io
  });
};

/**
 * Helper utility to trigger a notification broadcast via Socket.IO.
 * Useful for triggering notifications from the REST API controllers.
 * 
 * @function sendNotificationViaSocket
 * @param {import('socket.io').Server} io - Socket.io server instance.
 * @param {string} recipientId - ID of the target user.
 * @param {string} type - Notification type identifier.
 * @param {string} title - High-level notification summary.
 * @param {string} message - Detailed notification body.
 * @param {Object} [options] - Additional context like relatedUserId, relatedRoomId, etc.
 */
const sendNotificationViaSocket = (
  io,
  recipientId,
  type,
  title,
  message,
  options = {},
) => {
  // Emit the send-notification internal event to trigger the main handler logic
  io.emit("send-notification", {
    recipientId,
    type,
    title,
    message,
    relatedUser: options.relatedUserId,
    relatedRoom: options.relatedRoomId,
    actionUrl: options.actionUrl,
  });
};

module.exports = { notificationSocketHandler, sendNotificationViaSocket };

