const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const { sendEventsToAll } = require('../routes/events')

exports.createComment_post = async (req, res, next) => {
    const { content, postId, userId } = req.body;

    try {
        const newComment = new Comment({
            content,
            post: postId,
            author: userId
        })

        await newComment.save();
        const user = await User.findById(userId);


        await Post.findByIdAndUpdate(postId, { $push: { comments: newComment } });

        const comment = {
            content,
            post: postId,
            author: user,
            createdAt: new Date()
        }
        
        sendEventsToAll({
            type: 'comment',
            comment,
            postId: postId,
            time: new Date().toLocaleTimeString()            
        })
        res.status(201).json({ commented: true, comment: newComment })
    } catch (err) {
        next(err)
    }
}

exports.deleteComment_del = async (req, res, next) => {

    const { commentId, postId } = req.params;

    try {
        await Comment.findByIdAndDelete(commentId);
        await Post.findByIdAndUpdate(postId, { $pull: { comments: commentId } });

        res.json({ deleted: true })
    } catch (e) {
        next(e)
    }
}

