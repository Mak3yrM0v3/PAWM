const mongoose = require("mongoose");

// Define a Mongoose schema for short URLs
const shortUrlSchema = new mongoose.Schema({
  originalUrl: String, // The original URL that will be shortened
  shortUrl: String,    // The generated short URL
  userId: {            // Reference to the user who created this short URL
    type: mongoose.Schema.Types.ObjectId, // A MongoDB object ID
    ref: "user" // Reference to the "user" model (assumes a "User" model exists)
  },
});

// Export a Mongoose model based on the short URL schema
module.exports = mongoose.model("ShortURL", shortUrlSchema);
