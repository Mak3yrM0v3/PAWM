const mongoose = require("mongoose");

// Define a Mongoose schema for user data
const userSchema = new mongoose.Schema({
  first_name: { type: String, default: null }, // User's first name (with a default value of null)
  last_name: { type: String, default: null },  // User's last name (with a default value of null)
  email: { type: String, unique: true },        // User's email (must be unique)
  password: { type: String },                   // User's password (hashed and securely stored)
});

// Export a Mongoose model based on the user schema
module.exports = mongoose.model("user", userSchema);
