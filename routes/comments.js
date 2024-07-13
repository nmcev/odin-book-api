const express = require('express');
const router = express.Router();
const {
    createComment_post,
    deleteComment_del
} = require('../controllers/commentsControllers');
const { isAuthenticated } = require('../auth/isAuth');

// CREATE a comment
router.post('/comments', isAuthenticated, createComment_post)

// DELETE a comment
router.delete('/comments/:postId/:commentId', isAuthenticated, deleteComment_del);


module.exports = router;
