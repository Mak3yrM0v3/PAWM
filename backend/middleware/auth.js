// Imports
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require("../model/user");

// JWT configuration
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from the 'Authorization' header
  secretOrKey: process.env.TOKEN_KEY // Secret key used to verify the JWT
};

// Define and configure a new JWT strategy
passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        // Attempt to find a user based on the user_id from the JWT payload
        const user = await User.findOne({ _id: jwt_payload.user_id });

        if (user) {
            // If a user is found, pass it to the 'done' callback
            return done(null, user);
        } else {
            // If no user is found, pass 'false' to indicate authentication failure
            return done(null, false);
        }
    } catch (err) {
        // Handle any errors by passing 'err' to indicate authentication failure
        return done(err, false);
    }
}));

// Define an 'auth' middleware function for route protection
const auth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
        // If there's an error, log it and send an error response
        console.error(err);
        return res.status(500).send({ error: 'Error occurred while authenticating', details: err });
    }
    if (!user) {
        // If no user is authenticated, send a 401 Unauthorized response
        return res.status(401).json({
            message: 'Invalid Token',
            user: user,
            tokenPayloadDecodedByPassport: info  // Additional info about what went wrong
        });
    }
    // If authentication is successful, set the user on the request object and proceed to the next middleware
    req.user = user;
    return next();
  })(req, res, next);
};

// Export the 'auth' middleware function for use in other parts of the application
module.exports = auth;
