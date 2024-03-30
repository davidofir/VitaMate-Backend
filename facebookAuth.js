const passport = require('passport');
const { createOrUpdate, getUserById } = require('./services/userService');
var FacebookStrategy = require( 'passport-facebook' ).Strategy;


passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_OAUTH_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_OAUTH_CLIENT_SECRET,
    callbackURL: "http://localhost:4000/auth/facebook/callback",
    enableProof: true
  },
  async function( accessToken, refreshToken, profile, done) {
    await createOrUpdate(profile);
    return done(null,profile);
  }
));

passport.serializeUser((user,done)=>{
    done(null,{
      _id:user.id,
      displayName:user.displayName,
      provider:'facebook'
    });
})

passport.deserializeUser(async(userData,done)=>{
  try {
    const user = await getUserById(userData._id);
    done(null, user);
} catch (error) {
    done(error, null);
}
})