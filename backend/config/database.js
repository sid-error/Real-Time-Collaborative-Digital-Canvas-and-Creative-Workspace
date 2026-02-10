/**
 * @fileoverview Database configuration and connection logic using Mongoose.
 */

// Import the mongoose library to interact with MongoDB
const mongoose = require("mongoose");

/**
 * Establishes a connection to the MongoDB database with retry logic.
 * 
 * @async
 * @function connectDB
 * @throws {Error} If connection fails after maximum retries.
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  // Define maximum number of connection attempts
  const MAX_RETRIES = 5;
  // Define delay between retries in milliseconds (5 seconds)
  const RETRY_DELAY = 5000; 

  // Loop through retry attempts
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      // Attempt to connect to MongoDB using the URI from environment variables
      await mongoose.connect(process.env.MONGO_URI);
      // Log success message if connection is established
      console.log("MongoDB connected");
      // Exit the function if connection is successful
      return; 
    } catch (error) {
      // Log error message if a connection attempt fails
      console.error(`Database connection attempt ${i + 1} failed:`, error.message);
      // If we haven't reached the max retries, wait and try again
      if (i < MAX_RETRIES - 1) {
        // Log waiting message
        console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
        // Wait for the specified delay before next attempt
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      } else {
        // Log failure message if all attempts are exhausted
        console.error("Max retries reached. Exiting.");
        // Terminate the process with failure code
        process.exit(1);
      }
    }
  }
};

// Export the connectDB function to be used in other files
module.exports = connectDB;


