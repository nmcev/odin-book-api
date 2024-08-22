const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .populate('user', 'username profilePic')
            .populate('post', 'content');

        res.json(notifications);
    } catch (e) {
        next(e);
    }
};