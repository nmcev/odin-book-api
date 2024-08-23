const User = require('../models/User');
const DemoUser = require('../models/DemoUser');

exports.getAllUsers_get = async (req, res, next) => {
    try {
        const users = await User.find().select('-password');

        res.json(users);
    } catch (error) {
        next(error)
    }

};


exports.getAUser_get = async (req, res, next) => {
    try {


        const user = await User.findOne({ username: req.params.username }).populate('followers').populate('following')
            .populate({
                path: 'posts',
                populate: { path: 'author', select: 'username name profilePic' }
            })
            .populate({
                path: 'repostedPosts',
                populate: { path: 'author', select: 'username name profilePic' }
            })
            .select('-password');
        if (!user) return res.status(404).send('User not found');

        user.posts.sort((a, b) => b.createdAt - a.createdAt)
        res.json(user);

    } catch (error) {
        next(error)
    }
}

exports.search_get = async (req, res, next) => {
    const { username } = req.query;


    try {
        const users = await User.find({ username: { $regex: username, $options: 'i' } });

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }
        res.json(users);

    } catch (e) {

        next(e);
    }
}

exports.getAllDemoUsers_get = async (req, res, next) => {
    try {
        const users = await DemoUser.find().select('-password');

        res.json(users);
    } catch (error) {
        next(error)
    }

};
