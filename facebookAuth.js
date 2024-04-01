const passport = require('passport');
const { createOrUpdate } = require('./services/userService');
const jwt = require('jsonwebtoken');
var FacebookStrategy = require( 'passport-facebook' ).Strategy;


passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_OAUTH_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_OAUTH_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL}/auth/facebook/callback`,
    passReqToCallback:true
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
