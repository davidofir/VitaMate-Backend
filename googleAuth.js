const passport = require('passport');
const jwt = require('jsonwebtoken');
const userService = require('./services/userService'); 
const GoogleStrategy = require('passport-google-oauth2').Strategy;

require('./jwtAuth'); 

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
    passReqToCallback: true
  },
  async function(request, accessToken, refreshToken, profile, done) {
    try {
      const user = await userService.createUser(profile);
      
      // Ensure the user object has all required fields for JWT
      if (!user || !user._id) {
        throw new Error('User creation or retrieval failed');
      }

      const token = jwt.sign({
        id: user._id, // Make sure _id is a string, as used in the Database class
        displayName: user.displayName,
        email: user.email
      }, process.env.JWT_SECRET, { expiresIn: '24h' });

      return done(null, { user, token });
    } catch (error) {
      console.error('Authentication error:', error); // Improved error logging
      return done(error, null);
    }
  }
));