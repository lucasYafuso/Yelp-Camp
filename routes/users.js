const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const {checkReturnTo} = require ('../middleware')
const users = require('../controllers/users')


router.route('/register')
    .get(users.registerForm)
    .post(catchAsync(users.registerUser))

router.route('/login')
    .get(users.loginForm)
    .post(checkReturnTo ,passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout);

module.exports = router