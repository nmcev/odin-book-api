const { body, validationResult } = require('express-validator');
const User = require('../models/User');


exports.login_post = [
    (req, res, next) => {

        if (!req.isAuthenticated()) {
            return res.status(400).json({ errors: [{ message: 'Login failed' }] });
        }

        res.json({ message: "logged in successfully!", user: req.user })
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


        const { username, password, profilePic } = req.body;
        try {
            const existUser = await User.findOne({ username });

            if (existUser) {
                return res.status(400).json({ message: 'User already exist!' });
            }

            const newUser = new User({
                username,
                password,
                profilePic,
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


exports.auth_get = (req, res) => {
    res.json({ user: req.user });
}
