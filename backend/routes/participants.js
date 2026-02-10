/**
 * @fileoverview Routes for managing room participants, roles, and moderation actions.
 */

// Import express to handle server-side routing
const express = require("express");
// Import the authentication middleware to verify user identity before processing requests
const auth = require("../middleware/authh");
// Destructure and import the necessary handler functions from the participant controller
const {
  getRoomParticipants,
  assignRole,
  kickParticipant,
  banParticipant,
  unbanParticipant,
  searchParticipants,
} = require("../controllers/participantController");

// Initialize a new Express router for participant-related endpoints
const router = express.Router();

/**
 * @route   GET /api/participants/room/:roomId
 * @desc    Get all participants in a specific room.
 * @access  Private (Owner/Moderator)
 */
// Endpoint to list all users currently or previously active in a given room
router.get("/room/:roomId", auth, getRoomParticipants);

/**
 * @route   PUT /api/participants/:roomId/:participantId/role
 * @desc    Assign a role to a participant (e.g., promote to moderator).
 * @access  Private (Owner only)
 */
// Endpoint to elevate or demote the permissions of a user within a room session
router.put("/:roomId/:participantId/role", auth, assignRole);

/**
 * @route   POST /api/participants/:roomId/:participantId/kick
 * @desc    Kick a participant from a room.
 * @access  Private (Owner/Moderator)
 */
// Endpoint to forcibly remove a user from the active session
router.post("/:roomId/:participantId/kick", auth, kickParticipant);

/**
 * @route   POST /api/participants/:roomId/:participantId/ban
 * @desc    Ban a participant from a room.
 * @access  Private (Owner/Moderator)
 */
// Endpoint to remove a user and prevent them from rejoining the room in the future
router.post("/:roomId/:participantId/ban", auth, banParticipant);

/**
 * @route   POST /api/participants/:roomId/:participantId/unban
 * @desc    Unban a participant from a room.
 * @access  Private (Owner only)
 */
// Endpoint to lift a previous ban and allow a user to rejoin a session
router.post("/:roomId/:participantId/unban", auth, unbanParticipant);

/**
 * @route   GET /api/participants/room/:roomId/search
 * @desc    Search/filter participants within a room.
 * @access  Private
 */
// Endpoint to find specific members within a room based on search criteria
router.get("/room/:roomId/search", auth, searchParticipants);

// Export the configured router to be registered in the main application file
module.exports = router;


