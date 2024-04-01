const express = require('express');
const passport = require('passport');
const router = express.Router();
require('../facebookAuth');
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { session: false, failureRedirect: '/auth/facebook/failure' }),
  function(req, res) {
    const token = req.user.token;

    res.redirect(`${process.env.CLIENT_URL}?token=${encodeURIComponent(token)}`);
  }
);


router.get('/auth/facebook/failure', (req, res) => res.send('Something went wrong'));



module.exports = router;