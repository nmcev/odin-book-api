var express = require('express');
var router = express.Router();
const {
    createPost_post,
    allPosts_get,
    userPosts_get,
    post_delete,
    likePost_post,
    unlikePost_post,
} = require('../controllers/postsControllers');

const { isAuthenticated } = require('../auth/isAuth')

// CREATE post
router.post('/posts', isAuthenticated, createPost_post);

// GET posts (for not logged in users);
router.get('/posts', allPosts_get);

// GET posts (for logged in user)
router.get('/posts/user', isAuthenticated, userPosts_get);

// DELETE a post 
router.delete('/posts/:id', isAuthenticated, post_delete);

// LIKE a post
router.post('/posts/like/:id', likePost_post);

// remove a LIKE
router.post('/posts/unlike/:id', unlikePost_post);

// TODO: UPDATE post

module.exports = router;

