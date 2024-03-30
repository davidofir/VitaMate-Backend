const express = require('express');
const passport = require('passport');
const router = express.Router();
require('../facebookAuth');
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/protected', failureRedirect: '/auth/facebook/failure' }));
router.get('/auth/facebook/failure', (req, res) => res.send('Something went wrong'));
router.get('/logout',(req,res)=>{
    req.session.destroy((err)=>{
        return err;
    });
    res.send('Goodbye');
})

module.exports = router;