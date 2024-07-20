const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const passport = require('passport')

exports.login_post = [
    (req, res, next) => {
        passport.authenticate('local', async (err, user, info) => {
            if (err) {
                return res.status(500).json({ message: 'Server error', error: err.message });
            }
            if (!user) {
                return res.status(401).json({ message: info.message || 'Login failed' });
            }

            const populatedUser = await User.findById(user._id)
                .populate('posts')
                .populate('following')
                .populate('followers')
                .populate('repostedPosts')
                .select('-password')

                .exec();

            req.logIn(user, (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Server error', error: err.message });
                }
                return res.json({ message: 'Logged in successfully!', user: populatedUser });
            });
        })(req, res, next);

    }
]


exports.register_post = [
    body('username')
        .trim()
        .isLength({ min: 3 })
        .escape()
        .withMessage('Username must be at least 3 characters'),
    body('password')
        .isLength({ min: 6 })
        .trim()
        .withMessage('Password must be at least 6 characters'),

    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }


        let { username, password, profilePic, bio } = req.body;
        username = username.toLowerCase();
        try {
            const existUser = await User.findOne({ username });

            if (existUser) {
                return res.status(400).json({ message: 'User already exist!' });
            }

            const newUser = new User({
                username,
                password,
                profilePic,
                bio
            })

            await newUser.save();

            res.status(200).json('user created successfully!')
        } catch (e) {
            next(e);
        }
    }
];

exports.logout_post = async (req, res) => {

    req.logout(function (err) {
        if (err) { return next(err); }
        res.json({ message: 'logged out successfully!' });
    });

}


exports.auth_get = async (req, res) => {
    const user = req.user
    
    const populatedUser = await User.findById(user._id)
    .populate('posts')
    .populate('following')
    .populate('followers')
        .populate('repostedPosts')
        .select('-password')
    .exec();


    res.json({ user: populatedUser });
}
