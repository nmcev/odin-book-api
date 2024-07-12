const express = require('express');
const router = express.Router();
const {
    followUser_post,
    unfollowUser_del
}
    = require('../controllers/followControllers');

const { isAuthenticated } = require('../auth/isAuth');

// POST follow a user
router.post('/follow/:userId', isAuthenticated, followUser_post);

// DELETE unfollow a user
router.delete('/unfollow/:userId', isAuthenticated, unfollowUser_del);

module.exports = router

