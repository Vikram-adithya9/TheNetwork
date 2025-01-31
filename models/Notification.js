const mongoose = require('mongoose');
const User = require('User');

const notificationSchema = new mongoose.Schema({
    userSent : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    target : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message : { type: String },
    readStatus : { type: Boolean },
    sentStatus : { type: Boolean},
}, { timestamps: true });
