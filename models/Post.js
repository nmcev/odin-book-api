const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', require: true },
    content: { type: String, require: true },
    media: { type: String, require: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Post', postSchema);
