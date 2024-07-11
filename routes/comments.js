const express = require('express');
const router = express.Router();
const {
    createComment_post,
    deleteComment_del
} = require('../controllers/commentsControllers');

// CREATE a comment
router.post('/comments', createComment_post) // todo: user should be authenticated to comment!(just use the isAuthenticated middleware);

// DELETE a comment
router.delete('/comments/:postId/:commentId', deleteComment_del);


module.exports = router;
