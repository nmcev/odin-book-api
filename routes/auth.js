const express = require('express');
const router = express.Router();
const authControllers = require('../controllers/authControllers');
const { isAuthenticated } = require('../auth/isAuth')
const passport = require('passport');


// login route
router.post('/login', authControllers.login_post)


// register router
router.post('/register', authControllers.register_post);

// check authentication
router.get('/auth', isAuthenticated, authControllers.auth_get);

// logout router
router.post('/logout', authControllers.logout_post);

// PITCH update user profile
router.patch('/edit-profile', isAuthenticated, authControllers.updateProfile )
module.exports = router;