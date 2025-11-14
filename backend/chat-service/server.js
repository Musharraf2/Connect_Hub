const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/connect_hub_chat';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Import routes
const chatRoutes = require('./routes/chat.routes');
const messageRoutes = require('./routes/message.routes');
const uploadRoutes = require('./routes/upload.routes');

// Use routes
app.use('/api/chat', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'chat-service' });
});

// Socket.io connection handling
const userSockets = new Map(); // userId -> socketId mapping
const onlineUsers = new Map(); // userId -> { lastSeen, status }

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User authentication and registration
  socket.on('user:register', (userId) => {
    userSockets.set(userId.toString(), socket.id);
    onlineUsers.set(userId.toString(), { 
      status: 'online', 
      lastSeen: new Date() 
    });
    
    // Broadcast online status to all users
    io.emit('user:status', {
      userId,
      status: 'online',
      lastSeen: new Date()
    });
    
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Join a chat room
  socket.on('chat:join', (chatRoomId) => {
    socket.join(chatRoomId);
    console.log(`Socket ${socket.id} joined room ${chatRoomId}`);
  });

  // Leave a chat room
  socket.on('chat:leave', (chatRoomId) => {
    socket.leave(chatRoomId);
    console.log(`Socket ${socket.id} left room ${chatRoomId}`);
  });

  // Handle new messages
  socket.on('message:send', async (data) => {
    const { chatRoomId, message } = data;
    
    // Broadcast message to room
    io.to(chatRoomId).emit('message:receive', message);
    
    console.log(`Message sent to room ${chatRoomId}`);
  });

  // Handle typing indicator
  socket.on('typing:start', (data) => {
    const { chatRoomId, userId, userName } = data;
    socket.to(chatRoomId).emit('typing:update', {
      userId,
      userName,
      isTyping: true
    });
  });

  socket.on('typing:stop', (data) => {
    const { chatRoomId, userId } = data;
    socket.to(chatRoomId).emit('typing:update', {
      userId,
      isTyping: false
    });
  });

  // Handle read receipts
  socket.on('message:read', (data) => {
    const { chatRoomId, messageId, userId } = data;
    io.to(chatRoomId).emit('message:read:update', {
      messageId,
      userId,
      readAt: new Date()
    });
  });

  // WebRTC signaling for voice calls
  socket.on('call:initiate', (data) => {
    const { targetUserId, offer, callerId, callerName } = data;
    const targetSocketId = userSockets.get(targetUserId.toString());
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('call:incoming', {
        offer,
        callerId,
        callerName
      });
    }
  });

  socket.on('call:answer', (data) => {
    const { targetUserId, answer } = data;
    const targetSocketId = userSockets.get(targetUserId.toString());
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('call:answered', { answer });
    }
  });

  socket.on('call:ice-candidate', (data) => {
    const { targetUserId, candidate } = data;
    const targetSocketId = userSockets.get(targetUserId.toString());
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('call:ice-candidate', { candidate });
    }
  });

  socket.on('call:end', (data) => {
    const { targetUserId } = data;
    const targetSocketId = userSockets.get(targetUserId.toString());
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('call:ended');
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Find and remove user from online users
    let disconnectedUserId = null;
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        userSockets.delete(userId);
        onlineUsers.set(userId, {
          status: 'offline',
          lastSeen: new Date()
        });
        break;
      }
    }
    
    if (disconnectedUserId) {
      io.emit('user:status', {
        userId: disconnectedUserId,
        status: 'offline',
        lastSeen: new Date()
      });
    }
    
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Chat service running on port ${PORT}`);
});

module.exports = { app, io };
