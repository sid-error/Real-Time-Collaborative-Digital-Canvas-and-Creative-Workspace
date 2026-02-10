/**
 * @fileoverview Routes for managing user notifications.
 */

// Import express to handle routing
const express = require("express");
// Destructure and import specific controller methods for notification logic
const {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");
// Import authentication middleware to protect notification endpoints
const auth = require("../middleware/authh");
// Import asyncHandler to wrap controller calls and manage errors
const { asyncHandler } = require("../middleware/errorHandler");

// Create a new router instance
const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the current user.
 * @access  Private
 */
// Endpoint to fetch the list of notifications
router.get("/", auth, asyncHandler(getNotifications));

/**
 * @route   GET /api/notifications/unread/count
 * @desc    Get the count of unread notifications.
 * @access  Private
 */
// Endpoint to get a simple number representing unread alerts
router.get("/unread/count", auth, asyncHandler(getUnreadCount));

/**
 * @route   POST /api/notifications/:id/read
 * @desc    Mark a specific notification as read.
 * @access  Private
 */
// Endpoint to update the read status of a single notification
router.post("/:id/read", auth, asyncHandler(markNotificationAsRead));

/**
 * @route   POST /api/notifications/mark-all-read
 * @desc    Mark all notifications for the current user as read.
 * @access  Private
 */
// Endpoint to bulk update all unread notifications to read
router.post("/mark-all-read", auth, asyncHandler(markAllAsRead));

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a specific notification.
 * @access  Private
 */
// Endpoint to remove a specific notification from the database
router.delete("/:id", auth, asyncHandler(deleteNotification));

// Export the router for inclusion in the main app
module.exports = router;


