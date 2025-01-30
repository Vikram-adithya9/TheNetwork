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

const Message = require('../models/Message'); // Import Message model

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } }); // Enable CORS for Socket.IO

// Middleware and static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    server.listen(process.env.PORT || 8080, () => {
      console.log('Server running on port 5000');
    });
  })
  .catch(err => console.log(err));

// Real-time Messaging
let users = {}; // To track connected users

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Register a user
  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log(`User registered: ${userId}`);
  });

  // Handle sending messages
  socket.on('sendMessage', async (messageData) => {
    const { senderId, receiverId, message } = messageData;

    try {
      // Save the message to the database
      const newMessage = await Message.create({ senderId, receiverId, message });

      // Emit to the recipient if online
      if (users[receiverId]) {
        io.to(users[receiverId]).emit('receiveMessage', newMessage);
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});
