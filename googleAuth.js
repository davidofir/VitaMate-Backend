const passport = require('passport');
const { createOrUpdate, getUserById } = require('./services/userService');
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    callbackURL: "http://localhost:4000/auth/google/callback",
    passReqToCallback   : true
  },
  async function(request, accessToken, refreshToken, profile, done) {
    await createOrUpdate(profile);
    return done(null,profile);
  }
));

passport.serializeUser((user,done)=>{
    done(null,{
      _id:user.id,
      given_name: user.given_name,
      family_name: user.family_name
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