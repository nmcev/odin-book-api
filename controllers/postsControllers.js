const Notification = require('../models/Notification');
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
            newPost.populate('author')

            await newPost.save();

            await User.findByIdAndUpdate(user.id, { $push: { posts: newPost._id } });

            res.status(201).json(newPost);

        } catch (e) {
            next(e)
        }

    }
];


exports.allPosts_get = async (req, res, next) => {

    // allPosts_get: retrieve all posts for users who are currently not logged in.

    try {
        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 10);
        const documentsToSkip = (page - 1) * limit

        const allPosts = await Post.find().sort({ createdAt: -1 }).skip(documentsToSkip).limit(limit).populate({
            path: 'author',
            select: '-password'
        })

        shuffle(allPosts)
        res.json({ posts: allPosts });
    } catch (e) {
        next(e);
    }
};

exports.userPosts_get = async (req, res, next) => {
    
    try {
        const userId = req.user._id;

        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 10);
        const documentsToSkip = (page - 1) * limit;

        const user = await User.findById(userId)
            .populate({
                path: 'posts',
                populate: { path: 'author', select: 'username profilePic' }
            })
            .populate({
                path: 'following',
                populate: {
                    path: 'posts',
                    populate: { path: 'author', select: 'username profilePic' }
                }
            });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let posts = [
            ...user.posts,
            ...user.following.flatMap(followedUser => followedUser.posts)
        ];

        const allPosts = await Post.find()
            .populate('author', 'username profilePic content')
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username profilePic'
                }
            });

        
        posts.sort((a, b) => b.createdAt - a.createdAt);

        posts = [...posts, ...allPosts];

        const uniquePosts = Array.from(new Map(posts.map(post => [post._id.toString(), post])).values());

        uniquePosts.sort((a, b) => b.createdAt - a.createdAt);

        
        const paginatedPosts = uniquePosts.slice(documentsToSkip, documentsToSkip + limit);


        res.status(200).json({ posts: paginatedPosts });
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
        const post = await Post.findById(postId).populate('author');

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.likes.includes(req.user._id)) {
            return res.status(400).json({ error: 'User has already liked this post' });
        }

        await Post.findByIdAndUpdate(postId, { $push: { likes: req.user._id } });

        const postOwner = post.author

        if (postOwner && req.user._id.toString() !== postOwner._id.toString()) {
            const notification = new Notification({
                type: 'like',
                user: req.user._id, // the user who liked the post
                recipient: postOwner._id,// the owner of the post
                post
            })

            await notification.save();
        }

        res.json({ like: true });
    } catch (e) {
        next(e)
    }
};

exports.unlikePost_post = async (req, res, next) => {

    try {
        const postId = req.params.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }


        await Post.findByIdAndUpdate(postId, { $pull: { likes: req.user._id } });

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
            const post = await Post.findById(postId)
            .populate('author', 'username profilePic content ')
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username profilePic'
                }
            });
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
            res.status(200).json(post);

        } catch (e) {
            next(e);
        }
    }

]

exports.getPost_get = async (req, res, next) => {
    const { id } = req.params;

    try {
        const post = await Post.findById(id)
            .populate('author', 'username profilePic content ')
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username profilePic'
                }
            });


        if (!post) {
            return res.status(404).json('Post not found!')
        }

        res.json(post)
    } catch (e) {
        next(e)
    }

}


exports.repost_patch = async (req, res, next) => {

    const { postId } = req.body
    const userId = req.user._id

    try {

        await User.findByIdAndUpdate(userId, { $addToSet: { repostedPosts: postId } }); // addToSet: for preventing duplicate post ids

        const post = await Post.findById(postId)
            .populate('author', 'username profilePic content ')
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username profilePic'
                }
            });
        const postOwner = post.author

        if (postOwner && postOwner._id.toString() !== userId.toString()) {

            const notification = new Notification({
                type: 'repost',
                user: userId,
                recipient: postOwner._id,
                post
            })

            await notification.save()

        }




        res.json(post)

    } catch (error) {
        next(error)
    }


}


exports.unrepost_patch = async (req, res, next) => {
    const { postId } = req.params
    const userId = req.user._id;

    try {
        await User.findByIdAndUpdate(userId, {
            $pull: { repostedPosts: postId }
        });

        res.status(200).json({ postId });
    } catch (error) {
        res.status(500).send({ message: 'Error unreposting the post', error });
    }

}
function shuffle(array) {
    let currentIndex = array.length;

    while (currentIndex != 0) {

        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}
