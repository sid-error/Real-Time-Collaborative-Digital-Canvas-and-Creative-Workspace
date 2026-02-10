/**
 * @fileoverview Controller for managing user notifications.
 */

// Import the Notification model to interact with the notifications collection
const Notification = require("../models/Notification");
// Import the User model as it might be needed for validation or association
const User = require("../models/User");

/**
 * Fetches notifications for the current user with pagination and filtering.
 * 
 * @async
 * @function getNotifications
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
const getNotifications = async (req, res) => {
  try {
    // Destructure pagination and filter parameters from the query string
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    // Define the base query to find notifications for the logged-in user
    const query = { recipient: req.user._id };
    // If 'unreadOnly' is passed as true, filter the results to only include unread notifications
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    // Execute the database search with secondary data population and pagination logic
    const notifications = await Notification.find(query)
      // Populate details for any user mentioned in the notification
      .populate("relatedUser", "username avatar")
      // Populate details for any room associated with the notification
      .populate("relatedRoom", "name roomCode")
      // Sort the results so that the most recent notifications appear first
      .sort({ createdAt: -1 })
      // Limit the number of records returned for this page
      .limit(limit * 1)
      // Skip records according to the current page number
      .skip((page - 1) * limit);

    // Get a total count of documents matching the query for pagination calculations
    const total = await Notification.countDocuments(query);

    // Send the results and pagination metadata back to the client
    res.json({
      success: true,
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    // Return a 500 error status if the database operation fails
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

/**
 * Gets the count of unread notifications for the current user.
 * 
 * @async
 * @function getUnreadCount
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
const getUnreadCount = async (req, res) => {
  try {
    // Count how many notifications for this user have 'isRead' set to false
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    // Return the resulting number to the client
    res.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    // Respond with a 500 status on count failure
    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
      error: error.message,
    });
  }
};

/**
 * Marks a specific notification as read.
 * 
 * @async
 * @function markNotificationAsRead
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
const markNotificationAsRead = async (req, res) => {
  try {
    // Extract the notification ID from URL parameters
    const { id } = req.params;

    // Find and update the specific notification for the current user
    const notification = await Notification.findOneAndUpdate(
      // Ensure the user owns the notification being modified
      { _id: id, recipient: req.user._id },
      {
        // Set the status to read
        isRead: true,
        // Record the exact time it was read
        readAt: new Date(),
      },
      // Return the updated document instead of the original
      { new: true },
    );

    // If no notification was found, return a 404 status
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Acknowledge the operation's success
    res.json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    // Handle database errors with a 500 status code
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

/**
 * Marks all notifications for the current user as read.
 * 
 * @async
 * @function markAllAsRead
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
const markAllAsRead = async (req, res) => {
  try {
    // Perform a bulk update for all unread notifications belonging to the user
    const result = await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      {
        // Update read status for all matching records
        isRead: true,
        // Record the current time as the read timestamp
        readAt: new Date(),
      },
    );

    // Confirm the bulk operation to the client
    res.json({
      success: true,
      message: "All notifications marked as read",
      // Include the number of records that were actually changed
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    // Return server error status on failure
    res.status(500).json({
      success: false,
      message: "Failed to mark all as read",
      error: error.message,
    });
  }
};

/**
 * Deletes a specific notification.
 * 
 * @async
 * @function deleteNotification
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
const deleteNotification = async (req, res) => {
  try {
    // Get the target notification ID from parameters
    const { id } = req.params;

    // Find and delete the notification document if it belongs to the active user
    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user._id,
    });

    // If no notification found, return 404
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Confirm successful removal
    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    // Log the database error and return a 500 status
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

/**
 * Internal utility to create a new notification.
 * 
 * @async
 * @function createNotification
 * @param {string} recipientId - ID of the user to receive the notification.
 * @param {string} type - Type of notification.
 * @param {string} title - Title of the notification.
 * @param {string} message - Message body.
 * @param {Object} [options] - Additional options (relatedUserId, relatedRoomId, actionUrl).
 * @returns {Promise<Notification|null>} The created notification object or null on failure.
 */
const createNotification = async (
  recipientId,
  type,
  title,
  message,
  options = {},
) => {
  try {
    // Construct a new Notification instance with the provided data
    const notification = new Notification({
      recipient: recipientId,
      type,
      title,
      message,
      // Map optional relationship fields from the options object
      relatedUser: options.relatedUserId,
      relatedRoom: options.relatedRoomId,
      actionUrl: options.actionUrl,
    });

    // Save the record to the database
    await notification.save();
    // Return the newly created notification document
    return notification;
  } catch (error) {
    // Log failures during background notification creation
    console.error("Error creating notification:", error);
    // Return null to allow the calling logic to continue gracefully
    return null;
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
};

