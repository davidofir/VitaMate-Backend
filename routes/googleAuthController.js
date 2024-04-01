const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken'); // Required for JWT
const router = express.Router();
require('../googleAuth');


router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));


router.get('/auth/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/auth/google/failure' }),
  function(req, res) {
    const token = req.user.token;

    res.redirect(`${process.env.CLIENT_URL}?token=${encodeURIComponent(token)}`);
  }
);


router.get('/auth/google/failure', (req, res) => res.send('Something went wrong'));



module.exports = router;