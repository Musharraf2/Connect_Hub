# Chat Service

Node.js + Express + Socket.io backend service for real-time chat functionality.

## Features

- Real-time messaging with Socket.io
- 1:1 and group chats
- Community-based chat filtering
- Message read receipts
- Typing indicators
- Online/offline status
- WebRTC signaling for voice calls
- Image and voice message uploads
- MongoDB for message persistence

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Make sure MongoDB is running locally or update `MONGODB_URI` in `.env`

4. Start the service:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Chat Rooms

- `GET /api/chat/user/:userId` - Get all chat rooms for a user
- `GET /api/chat/community/:community` - Get group chats for a community
- `POST /api/chat/direct` - Create or get 1:1 chat
- `POST /api/chat/group` - Create group chat
- `POST /api/chat/:chatRoomId/join` - Join group chat
- `GET /api/chat/:chatRoomId` - Get chat room details

### Messages

- `GET /api/messages/room/:chatRoomId` - Get messages for a chat room
- `POST /api/messages` - Send a message
- `POST /api/messages/:messageId/read` - Mark message as read

### Uploads

- `POST /api/upload/image` - Upload image
- `POST /api/upload/voice` - Upload voice message

## Socket.io Events

### Client → Server

- `user:register` - Register user with socket
- `chat:join` - Join a chat room
- `chat:leave` - Leave a chat room
- `message:send` - Send a message
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `message:read` - Mark message as read
- `call:initiate` - Initiate voice call
- `call:answer` - Answer voice call
- `call:ice-candidate` - Send ICE candidate
- `call:end` - End voice call

### Server → Client

- `user:status` - User online/offline status
- `message:receive` - New message received
- `typing:update` - Typing indicator update
- `message:read:update` - Message read receipt
- `call:incoming` - Incoming call
- `call:answered` - Call answered
- `call:ice-candidate` - ICE candidate
- `call:ended` - Call ended

## Environment Variables

- `PORT` - Server port (default: 4000)
- `MONGODB_URI` - MongoDB connection string
- `FRONTEND_URL` - Frontend URL for CORS
- `NODE_ENV` - Environment (development/production)
