const express = require("express");
const router = express.Router();
const passport = require('passport');
const dns = require("dns");
const bcrypt = require("bcrypt");
const ShortURL = require('./model/shortURL');
const User = require('./model/user');
const app = require('./app');

// Helper function to check if a URL is valid
const urlIsValid = (urlString) => {
  try {
    new URL(urlString);
  } catch (_) {
    return false;  
  }
  return true;
}

// Helper function to get the DNS address of a URL
const getDns = (url) => {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    dns.lookup(urlObj.host, (err, address) => {
      if (err) {
        resolve(null);
      } else {
        resolve(address);
      }
    });
  });
};

// Helper function to generate a short URL
const generateShortUrl = (originalUrl) => {
  const hash = bcrypt.hashSync(originalUrl, 10);
  const shortUrl = hash.replace(/[^a-zA-Z0-9]/g, "").substr(0, 6);
  return shortUrl;
};

// Route for creating a short URL
router.post("/url", passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { url } = req.body;
  const user = req.user;

  if (!url || !urlIsValid(url)) {
    return res.status(400).json({
      error: "No URL Provided",
      status: 400,
      message: "Properly formatted URL is required for the API to work."
    });
  }

  const existingShortUrl = await ShortURL.findOne({ originalUrl: url, userId: user._id });

  if (existingShortUrl) {
    return res.json(existingShortUrl);
  }

  const address = await getDns(url);

  if (!address) {
    return res.status(400).json({
      error: "Invalid URL",
      status: 400,
      message: `The provided URL ${url} is not resolvable. Please check the URL and try again.`
    });
  }

  const shortUrl = generateShortUrl(url);
  const newShortenedUrl = new ShortURL({
    originalUrl: url,
    shortUrl: shortUrl,
    userId: user._id,
  });

  try {
    await newShortenedUrl.save();
    res.json(newShortenedUrl);
  } catch (err) {
    return res.status(500).json({
      error: "Database Error",
      status: 500,
      message: `There was a problem saving the short URL to the database. Error details: ${err.message}`,
    });
  }
});

// Route for getting the user's short URLs
router.get("/url", passport.authenticate('jwt', { session: false }), async (req, res) => {
  const userId = req.user._id;

  try {
    const urls = await ShortURL.find({ userId: userId });
    return res.json(urls);
  } catch(err) {
    return res.status(500).json({
      error: "Database Error",
      status: 500,
      message: `There was a problem retrieving the URLs from the database. Error details: ${err.message}`
    });
  }
});

// Route for redirecting to the original URL using the short URL
router.get("/url/:shortUrl", passport.authenticate('jwt', { session: false }), async (req, res) => {
  const shortUrl = req.params.shortUrl;
  const user = req.user;
  
  try {
    const foundUrl = await ShortURL.findOne({ shortUrl: shortUrl, userId: user._id });

    if (!foundUrl) {
      return res.status(404).json({ 
        error: 'URL Not Found', 
        status: 404, 
        message: 'No short URL found for the given input' 
      });
    }

    res.redirect(foundUrl.originalUrl);
  } catch (err) {
    return res.status(500).json({
      error: "Database Error",
      status: 500,
      message: `There was a problem retrieving the URL from the database. Error details: ${err.message}`
    });
  }
});

// Route for searching user's short URLs
router.get("/search", passport.authenticate('jwt', { session: false }), async (req, res) => {
  const userId = req.user._id;
  const searchString = req.query.s;

  try {
    const urls = await ShortURL.find({ 
      userId: userId, 
      originalUrl: { $regex: searchString, $options: 'i' } 
    });

    return res.json(urls);
  } catch(err) {
    return res.status(500).json({
      error: "Database Error",
      status: 500,
      message: `There was a problem searching the URLs from the database. Error details: ${err.message}`
    });
  }
});

// Route for deleting a short URL
router.delete("/url/:shortUrl", passport.authenticate('jwt', { session: false }), async (req, res) => {
  const shortUrl = req.params.shortUrl;
  const userId = req.user._id;

  try {
    const urlToDelete = await ShortURL.findOneAndDelete({ shortUrl: shortUrl, userId: userId });

    if (!urlToDelete) {
      return res.status(404).json({ 
        error: 'URL Not Found', 
        status: 404, 
        message: 'No short URL found for the given input' 
      });
    }

    return res.json({ message: 'URL deleted successfully' });

  } catch (err) {
    return res.status(500).json({
      error: "Database Error",
      status: 500,
      message: `There was a problem deleting the URL. Error details: ${err.message}`
    });
  }
});

// Route for deleting user account and associated URLs
router.delete("/account", passport.authenticate('jwt', { session: false }), async (req, res) => {
  const userId = req.user._id;

  try {
    // Delete user
    const deletedUser = await User.deleteOne({ _id: userId });

    // Delete URLs created by the user
    const deletedUrls = await ShortURL.deleteMany({ userId: userId });

    return res.status(200).json({ message: 'Account deleted successfully.' });
  } catch (err) {
    return res.status(500).json({
      error: "Database Error",
      status: 500,
      message: `There was a problem deleting the account and associated URLs. Error details: ${err.message}`
    });
  }
});

// Route for redirecting to the original URL using a short URL (no authentication required)
router.get("/:shortUrl", async (req, res) => {
  const shortUrl = req.params.shortUrl;
  
  try {
    const foundUrl = await ShortURL.findOne({ shortUrl: shortUrl });

    if (!foundUrl) {
      return res.status(404).json({ 
        error: 'URL Not Found', 
        status: 404, 
        message: 'No short URL found for the given input' 
      });
    }

    res.redirect(foundUrl.originalUrl);
  } catch (err) {
    return res.status(500).json({
      error: "Database Error",
      status: 500,
      message: `There was a problem retrieving the URL from the database. Error details: ${err.message}`
    });
  }
});

module.exports = router;
