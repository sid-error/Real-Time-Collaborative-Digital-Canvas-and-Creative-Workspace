/**
 * @fileoverview Utility for generating unique room codes.
 */

/**
 * Generates a random alphanumeric room code.
 * 
 * @function generateRoomCode
 * @returns {string} A 4-character uppercase alphanumeric string.
 */
const generateRoomCode = () => {
  // Use Math.random to get a random fraction
  // Convert it to a base-36 string (0-9, a-z)
  // Extract a 4-character substring starting from index 2
  // Convert the entire string to uppercase for consistency
  return Math.random().toString(36).substr(2, 4).toUpperCase();
};

// Export the function as a property of an object
module.exports = { generateRoomCode };


