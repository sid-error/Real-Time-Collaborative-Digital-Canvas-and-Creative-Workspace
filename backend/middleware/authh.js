const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authh = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Access denied. No token provided." 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ensure we use 'id' to match the payload in your login route
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found. Invalid token." 
      });
    }

    req.user = user; 
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ 
      success: false, 
      message: "Session expired or invalid token." 
    });
  }
};

module.exports = authh;