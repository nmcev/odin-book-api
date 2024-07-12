const User = require('../models/User');

exports.getAllUsers_get = async (req, res, next) => {
    try {
        const users = await User.find();

        res.json(users);
    } catch (error) {
        next(error)
    }

};


exports.getAUser_get = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).send('User not found');

        res.json(user);

    } catch (error) {
        next(error)
    }
}
