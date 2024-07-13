const LocalStrategy = require('passport-local').Strategy;
const bcryptjs = require('bcryptjs');
const User = require('../models/User');

module.exports = function (passport) {

    passport.use(new LocalStrategy({ usernameField: "username" }, async (username, password, done) => {

        try {

            username = username.toLowerCase();
            const user = await User.findOne({ username });

            if (!user) return done(null, false, { message: "Incorrect username." });


            const isMatch = await bcryptjs.compare(password, user.password);

            if (!isMatch) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);

        } catch (error) {

            console.log(error)
        }
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id);
    })

    passport.deserializeUser(async (userId, done) => {
        try {
            const user = await User.findById(userId)
            done(null, user)
        } catch (err) {
            console.log(err)
        }
    })

}