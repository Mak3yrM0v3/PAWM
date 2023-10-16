const mongoose = require("mongoose");

const { MONGO_URI } = process.env; // Retrieve the MongoDB connection URI from environment variables

// Define and export a function named 'connect' for connecting to the database
exports.connect = () => {
  // Connecting to the database
  mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true, // Use the new URL parser (required for Mongoose)
    })
    .then(() => {
      // If the database connection is successful, log a success message
      console.log("Successfully connected to the database");
    })
    .catch((error) => {
      // If the database connection fails, log an error message, display the error, and exit the process
      console.log("Database connection failed. Exiting now...");
      console.error(error);
      process.exit(1); // Exit the Node.js process with an error code
    });
};
