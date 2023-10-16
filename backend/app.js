// Import necessary packages and configurations
require("dotenv").config(); // Load environment variables from a .env file
require("./config/database").connect(); // Connect to the database
const bcrypt = require("bcrypt"); // Used for hashing passwords
const express = require("express"); // Express.js framework for web applications
const jwt = require("jsonwebtoken"); // JSON Web Token for user authentication
const passport = require("passport"); // Passport for authentication strategies
const LocalStrategy = require("passport-local").Strategy; // Local authentication strategy
const session = require("express-session"); // Session management
const app = express(); // Create an Express application
const urls = require("./urls"); // URL shortening routes
const auth = require("./middleware/auth"); // Authentication middleware
const User = require("./model/user"); // User model
const cors = require("cors"); // Cross-Origin Resource Sharing (CORS) middleware

// Enable CORS for a specific origin (localhost on port 19006)
app.use(cors({
  origin: 'http://localhost:19006'
}));

// Use the 'urls' route handler for URL shortening
app.use('/', urls);

// Parse incoming JSON data
app.use(express.json());

// Configure session management
app.use(session({
  secret: process.env.SESSION_SECRET, // Secret key for session data
  resave: false,
  saveUninitialized: true
}));

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Define and configure the LocalStrategy for authenticating users
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'Invalid Credentials.' });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid Credentials.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Serialize and deserialize user objects for session management
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({ _id: id });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Define a route for the root URL
app.get('/', (req, res) => {
  res.send('Benvenuto alla route principale!'); // Respond with a welcome message
});

// Route for user registration
app.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!(email && password && first_name && last_name)) {
      res.status(400).send("All input is required");
    }

    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    let encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(),
      password: encryptedPassword,
    });

    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );

    user.token = token;
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

// Route for user login
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (authErr, user, info) => {
    if (authErr) {
      console.error(authErr);
      return res.status(400).send({ error: authErr });
    }
    if (!user) {
      return res.status(400).send({ error: "Invalid Credentials" });
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return res.status(400).send({ error: loginErr });
      }

      // Create a token for authentication
      const token = jwt.sign(
        { user_id: user._id, email: user.email },
        process.env.TOKEN_KEY,
        { expiresIn: '2h' }
      );

      res.cookie('jwt', token, { httpOnly: true, secure: true }); // Set a JWT cookie

      res.status(200).json({ message: "User authenticated", token: token }); // Send success response
    });
  })(req, res, next);
});

// Route for welcoming authenticated users
app.post("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 "); // Respond with a welcome message for authenticated users
});

// Use the 'urls' route for URL shortening, protected by the 'auth' middleware
app.use("/url-shortner", auth, urls);

// Export the Express application
module.exports = app;
