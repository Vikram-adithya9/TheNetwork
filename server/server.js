const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('../api/routes/authRoutes');
const postRoutes = require('../api/routes/postRoutes');
const commentRoutes = require('../api/routes/commentRoutes');
const userRoutes = require('../api/routes/userRoutes');

const Message = require('../models/Message');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    server.listen(process.env.PORT || 8080, () => {
      console.log('Server running on port 5000');
    });
  })
  .catch(err => console.log(err));

let users = {};

io.on('connection', (socket) => {

  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log(`User registered: ${userId}`);
  });

  socket.on('sendMessage', async (messageData) => {
    const { senderId, receiverId, message } = messageData;

    try {
      const newMessage = await Message.create({ senderId, receiverId, message });

      if (users[receiverId]) {
        io.to(users[receiverId]).emit('receiveMessage', newMessage);

      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});
