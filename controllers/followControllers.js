const Notification = require('../models/Notification');
const User = require('../models/User')

exports.followUser_post = async (req, res, next) => {
    const { userId } = req.params; // ID of user who will be followed
    const currentUserId = req.user.id;


    if (currentUserId === userId) {
        return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    try {
        await User.findByIdAndUpdate(userId, { $addToSet: { followers: currentUserId } },);

        await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: userId } },);

        const notification = new Notification({
            type: 'follow',
            user: currentUserId, // The user who clicked the "Follow" 
            recipient: userId // The user who is being followed 
        })

        await notification.save();
        res.status(200).json({ message: 'Followed user successfully' });


    } catch (error) {
        next(error);
    }
};



exports.unfollowUser_del = async (req, res, next) => {
    const { userId } = req.params; // ID of user who will be unfollowed
    const currentUserId = req.user.id;


    try {
        await User.findByIdAndUpdate(userId, { $pull: { followers: currentUserId } });

        await User.findByIdAndUpdate(currentUserId, { $pull: { following: userId } });


        res.status(200).json({ message: 'Unfollowed user successfully' });
    } catch (error) {
        next(error);
    }
};

