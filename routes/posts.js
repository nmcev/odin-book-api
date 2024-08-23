var express = require('express');
var router = express.Router();
const {
    createPost_post,
    allPosts_get,
    userPosts_get,
    post_delete,
    likePost_post,
    unlikePost_post,
    updatePost_patch,
    getPost_get,
    repost_patch,
    unrepost_patch
} = require('../controllers/postsControllers');

const { isAuthenticated } = require('../auth/isAuth')

// CREATE post
router.post('/posts', isAuthenticated, createPost_post);

// GET posts (for not logged in users);
router.get('/posts', allPosts_get);

// GET posts (for logged in user)
router.get('/posts/user', isAuthenticated, userPosts_get);

// GET posts (for logged in user)
router.get('/posts/user', isAuthenticated, userPosts_get);

// GET A
router.get('/posts/:id', getPost_get);

// DELETE a post 
router.delete('/posts/:id', isAuthenticated, post_delete);

// LIKE a post
router.post('/posts/like/:id', isAuthenticated, likePost_post);

// remove a LIKE
router.post('/posts/unlike/:id', isAuthenticated, unlikePost_post);

// UPDATE(patch) a post
router.patch('/posts/:id', isAuthenticated, updatePost_patch)

router.patch('/reposts', isAuthenticated, repost_patch )

router.patch('/unrepost/:postId', isAuthenticated, unrepost_patch )
module.exports = router;

