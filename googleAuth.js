const passport = require('passport');
const jwt = require('jsonwebtoken');
const { createOrUpdate } = require('./services/userService');
var GoogleStrategy = require('passport-google-oauth2').Strategy;

require('./jwtAuth'); 

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
    passReqToCallback: true
  },
  async function(request, accessToken, refreshToken, profile, done) {
    try {
      const user = await createOrUpdate(profile);
      
      const token = jwt.sign({
        id: user._id,
        displayName: user.displayName,
        email: user.email
      }, process.env.JWT_SECRET, { expiresIn: '24h' });

      return done(null, { user, token });
    } catch (error) {
      return done(error, null);
    }
  }
));
