/**
 * @fileoverview Authentication middleware for protected routes.
 */

// Import the jsonwebtoken library for session verification
const jwt = require("jsonwebtoken");
// Import the User model to fetch user details from the database
const User = require("../models/User");

/**
 * Middleware function to verify JWT tokens and attach the user object to the request.
 * 
 * @async
 * @function authh
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<void|import('express').Response>}
 */
const authh = async (req, res, next) => {
  try {
    // Extract the token from the 'Authorization' header and remove the 'Bearer ' prefix
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    // Check if the token exists in the request
    if (!token) {
      // Respond with 401 Unauthorized if no token is found
      return res.status(401).json({ 
        success: false, 
        message: "Access denied. No token provided." 
      });
    }

    // Verify the authenticity of the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch the user associated with the ID decoded from the token payload
    const user = await User.findById(decoded.id);

    // Check if a user was actually found in the database
    if (!user) {
      // Respond with 401 Unauthorized if the user record is missing
      return res.status(401).json({ 
        success: false, 
        message: "User not found. Invalid token." 
      });
    }

    // Attach the user object to the request for use in following middleware/routes
    req.user = user; 
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Log any errors encountered during the authentication process
    console.error("Auth Middleware Error:", error.message);
    // Respond with 401 Unauthorized if verification fails (e.g., expired or malformed token)
    res.status(401).json({ 
      success: false, 
      message: "Session expired or invalid token." 
    });
  }
};

// Export the authh middleware for use in protecting API routes
module.exports = authh;

