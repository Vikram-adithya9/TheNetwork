const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    anonymous: { type: Boolean, default: false },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });
