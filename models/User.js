const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcryptjs = require('bcryptjs');

const userSchema = new Schema({
    username: { type: String, require: true, unique: true },
    name: { type: String, require: true },
    password: { type: String, require: true },
    profilePic: { type: String },
    bio: { type: String, default: '' },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    repostedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
});


userSchema.pre('save', async function(next) {
    if (this.isModified('username')) {
        this.username = this.username.toLowerCase();
    }
    next();
});


// hash the password before saving it
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        try {
            const salt = await bcryptjs.genSalt(10);
            this.password =  await bcryptjs.hash(this.password, salt);
            next();
        } catch (err) {
            next(err);
        }
    } else {
        return next();
    }
});

module.exports = mongoose.model('User', userSchema)