const express = require('express');
const passport = require('passport');
const router = express.Router();
require('../googleAuth');
router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
router.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/protected', failureRedirect: '/auth/google/failure' }));
router.get('/auth/google/failure', (req, res) => res.send('Something went wrong'));
router.get('/logout', (req, res) => { req.logout(); res.send('Goodbye'); });

module.exports = router;