const User = require('../models/User');

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

        res.json(user);

    } catch (error) {
        next(error)
    }
}
