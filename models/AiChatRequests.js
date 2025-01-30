const mongoose = require('mongoose');

const aiChatRequestSchema = new mongoose.Schema({
    senderId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 10 }
});