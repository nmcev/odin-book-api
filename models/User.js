const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcryptjs = require('bcryptjs');

const userSchema = new Schema({
    username: { type: String, require: true, unique: true },
    name: { type: String, require: true },
    password: { type: String, require: true },
    ProfilePic: { type: String },
    bio: { type: String, default: '' },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    followRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
    repostedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
});

// hash the password before saving it
userSchema.pre('save', async function (next) {
    const user = this;

    if (!user.isModified('password')) return next(); // only hash the pw if it has been modified or new

    bcryptjs.genSalt(10, function (err, salt) {

        if (err) return next(err);

        bcryptjs.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        })
    })
})

module.exports = mongoose.model('User', userSchema)