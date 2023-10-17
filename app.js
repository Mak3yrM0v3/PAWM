require("dotenv").config();
require("./config/database").connect();
const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require ("jsonwebtoken");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const app = express();
const urls = require ('./urls');
const auth = require("./middleware/auth");
const User = require("./model/user");

app.use('/',urls);
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

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

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({ _id: id });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.get('/', (req, res) => {   
  res.send('Benvenuto alla route principale!'); 
});

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

      //create token
      const token = jwt.sign(
        { user_id: user._id, email: user.email }, 
        process.env.TOKEN_KEY,
        { expiresIn: '2h' }
      );

      res.cookie('jwt', token, { httpOnly: true, secure: true }); 

      res.status(200).json({message: "User authenticated",token: token}); 
      

      });
  })(req, res, next);
});

app.post("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

app.use("/url-shortner",auth,urls);

module.exports = app;