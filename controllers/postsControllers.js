const Post = require('../models/Post');
const User = require('../models/User');

const { body, validationResult } = require('express-validator');

exports.createPost_post = [
    body('content')
        .isLength({ min: 1 })
        .withMessage('Content must not be empty'),
    async (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { content, media } = req.body;
        const user = req.user; // user property will be attached to the request when the user is authenticated.

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        };


        try {

            const newPost = new Post({
                author: user.id,
                content,
                media
            });

            await newPost.save();

            await User.findByIdAndUpdate(user.id, { $push: { posts: newPost._id } });

            res.status(201).json({ post: newPost });

        } catch (e) {
            next(e)
        }

    }
];


exports.allPosts_get = async (req, res, next) => {

    // allPosts_get: retrieve all posts for users who are currently not logged in.

    try {
        const allPosts = await Post.find();

        res.json({ posts: allPosts });
    } catch (e) {
        next(e);
    }
};

exports.userPosts_get = async (req, res, next) => {

    // userPosts_get: retrieve users' posts and posts of those who are following.

    try {
        const userId = req.user._id;

        const user = await User.findById(userId).populate('posts').populate({
            path: 'following',
            populate: { path: 'posts' }
        })

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        };

        const posts = [
            ...user.posts,
            ...user.following.flatMap((user) => user.posts)
        ]


        posts.sort((a, b) => a.createdAt - b.createdAt);

        res.status(200).json({ posts })
    }
    catch (e) {
        next(e);
    }

};


exports.post_delete = async (req, res, next) => {

    try {
        const postId = req.params.id;

        await Post.findByIdAndDelete(postId);

        res.status(200).json({ message: 'Post deleted successfully!' });

    } catch (e) {
        next(e)
    }
};



exports.likePost_post = async (req, res, next) => {

    try {
        const postId = req.params.id;

        await Post.findByIdAndUpdate(postId, { $inc: { likes: 1 } });

        res.json({ like: true });
    } catch (e) {
        next(e)
    }
};

exports.unlikePost_post = async (req, res, next) => {

    try {
        const postId = req.params.id;

        await Post.findByIdAndUpdate(postId, { $inc: { likes: -1 } });

        res.json({ unlike: true })
    } catch (e) {
        next(e)
    }
};

exports.updatePost_patch = [
    body('content').optional().isLength({ min: 1 }).withMessage('Content must not be empty'),
    body('media').optional(),
    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });


        const { content, media } = req.body;
        const postId = req.params.id;

        try {
            const post = await Post.findById(postId);

            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            if (content !== undefined) {
                post.content = content;
            }
            if (media !== undefined) {
                post.media = media;
            }

            await post.save();
            res.status(200).json({ message: 'Post updated successfully', post });

        } catch (e) {
            next(e);
        }
    }

]
