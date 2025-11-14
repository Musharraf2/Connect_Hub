# Community Chat Feature

A real-time chat system with WebRTC voice calling, built with React (Next.js), Socket.io, Node.js, Express, and MongoDB.

## Features

✅ **Real-time Messaging**
- Instant message delivery with Socket.io
- Text, image, and voice messages
- Message read receipts
- Typing indicators
- Online/offline status

✅ **Chat Types**
- 1:1 Direct messaging
- Group chats
- Community-filtered user lists

✅ **Media Support**
- Image upload with preview
- Voice message recording
- File size validation (up to 10MB)

✅ **WebRTC Voice Calls**
- Peer-to-peer voice calling
- Socket.io signaling
- ICE candidate exchange

✅ **Modern UI**
- Three-panel layout (sidebar, chat area, info panel)
- Responsive design with Tailwind CSS
- Consistent theme tokens
- Mobile-friendly

## Architecture

### Backend (Chat Service)

**Location:** `/backend/chat-service/`

**Stack:**
- Node.js + Express
- Socket.io for real-time communication
- MongoDB for message persistence
- Multer for file uploads

**Key Components:**
- `server.js` - Main server with Socket.io setup
- `models/` - MongoDB schemas (ChatRoom, Message)
- `routes/` - API endpoints
- `controllers/` - Business logic

### Frontend

**Location:** `/Frontend/`

**Stack:**
- React 19 + Next.js 15
- TypeScript
- Tailwind CSS
- Socket.io-client

**Key Components:**
- `app/dashboard/chat/` - Chat page
- `components/chat/` - Chat components
- `lib/socket-context.tsx` - Socket.io provider
- `lib/chat-api.ts` - Chat API functions

## Setup Instructions

### 1. Install MongoDB

The chat service requires MongoDB. Install it:

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

**Windows:**
Download from [mongodb.com](https://www.mongodb.com/try/download/community)

### 2. Setup Chat Service (Backend)

```bash
cd backend/chat-service
npm install
cp .env.example .env
```

Edit `.env` if needed:
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/connect_hub_chat
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Start the chat service:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd Frontend
npm install
```

Create `.env.local`:
```bash
cp .env.local.example .env.local
```

Ensure it contains:
```
NEXT_PUBLIC_CHAT_SERVICE_URL=http://localhost:4000
```

Start the frontend:
```bash
npm run dev
```

### 4. Access the Application

1. Open http://localhost:3000
2. Log in with your account
3. Navigate to Chat from the header or dashboard

## Usage Guide

### Starting a 1:1 Chat

1. Click the chat icon in the sidebar
2. Select a user from your community
3. Start messaging!

### Creating a Group Chat

1. Click the "Users" icon in the chat sidebar
2. Enter a group name
3. Select members from your community
4. Click "Create Group"

### Sending Messages

**Text:**
- Type in the input field
- Press Enter or click Send

**Images:**
- Click the image icon
- Select an image file (PNG, JPG, GIF, WebP)
- Preview and send

**Voice Messages:**
- Click the microphone icon
- Record your message
- Preview and send

### Voice Calls (WebRTC)

1. Click the phone icon in the chat header
2. Wait for the other user to answer
3. Start talking!

## API Reference

### REST Endpoints

**Chat Rooms:**
- `GET /api/chat/user/:userId` - Get user's chat rooms
- `GET /api/chat/community/:community` - Get community group chats
- `POST /api/chat/direct` - Create/get 1:1 chat
- `POST /api/chat/group` - Create group chat
- `POST /api/chat/:chatRoomId/join` - Join group chat

**Messages:**
- `GET /api/messages/room/:chatRoomId` - Get messages
- `POST /api/messages` - Send message
- `POST /api/messages/:messageId/read` - Mark as read

**Uploads:**
- `POST /api/upload/image` - Upload image
- `POST /api/upload/voice` - Upload voice message

### Socket.io Events

**Client → Server:**
- `user:register` - Register user online
- `chat:join` - Join chat room
- `chat:leave` - Leave chat room
- `message:send` - Send message
- `typing:start` - Start typing
- `typing:stop` - Stop typing
- `message:read` - Mark message as read
- `call:initiate` - Start voice call
- `call:answer` - Answer call
- `call:ice-candidate` - Send ICE candidate
- `call:end` - End call

**Server → Client:**
- `user:status` - User online/offline
- `message:receive` - New message
- `typing:update` - Typing indicator
- `message:read:update` - Read receipt
- `call:incoming` - Incoming call
- `call:answered` - Call answered
- `call:ice-candidate` - ICE candidate
- `call:ended` - Call ended

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | Next.js 15 + React 19 |
| Frontend Language | TypeScript |
| Styling | Tailwind CSS |
| Real-time (Frontend) | Socket.io-client |
| Backend Runtime | Node.js |
| Backend Framework | Express |
| Real-time (Backend) | Socket.io |
| Database | MongoDB |
| Voice Calling | WebRTC |
| File Upload | Multer |

## Security Features

- ✅ File type validation
- ✅ File size limits (10MB)
- ✅ CORS configuration
- ✅ Community-based access control
- ✅ Socket authentication

## Troubleshooting

### Chat service won't start

**Error:** `MongoDB connection failed`
- Ensure MongoDB is running: `brew services start mongodb-community` (macOS)
- Check MongoDB URI in `.env`

### Socket connection fails

**Error:** `WebSocket connection failed`
- Ensure chat service is running on port 4000
- Check `NEXT_PUBLIC_CHAT_SERVICE_URL` in frontend `.env.local`
- Check browser console for CORS errors

### Images won't upload

**Error:** `Failed to upload image`
- Check file size (must be < 10MB)
- Verify file type (PNG, JPG, GIF, WebP)
- Ensure uploads directory exists and is writable

### Voice recording not working

**Error:** `Failed to access microphone`
- Grant microphone permissions in browser
- Use HTTPS in production (required for getUserMedia)
- Check browser compatibility (Chrome, Firefox, Safari)

## Production Deployment

### Backend (Chat Service)

1. Set environment variables:
```bash
export MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/chat
export FRONTEND_URL=https://your-frontend.com
export NODE_ENV=production
```

2. Use a production MongoDB (MongoDB Atlas recommended)

3. Use Cloudinary or S3 for file uploads (update `routes/upload.routes.js`)

4. Deploy to a Node.js host (Heroku, Railway, DigitalOcean, etc.)

### Frontend

1. Set environment variable:
```bash
NEXT_PUBLIC_CHAT_SERVICE_URL=https://your-chat-service.com
```

2. Build:
```bash
npm run build
```

3. Deploy to Vercel, Netlify, or any Next.js host

## Future Enhancements

- [ ] Video calling
- [ ] Message search
- [ ] File attachments (PDF, documents)
- [ ] Message reactions
- [ ] Push notifications
- [ ] Message encryption
- [ ] Admin moderation tools
- [ ] Chat export
- [ ] Pinned messages
- [ ] Message threading

## Contributing

1. Keep components modular
2. Follow existing code style
3. Add TypeScript types
4. Test real-time features
5. Update documentation

## License

Part of the Connect Hub platform.
