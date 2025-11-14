# Quick Start - Community Chat Feature

This guide will help you get the Community Chat feature up and running quickly.

## Prerequisites

Before starting, ensure you have:

- ✅ Node.js (v16 or later)
- ✅ MongoDB installed and running
- ✅ The main Connect Hub application set up

## Step 1: Install MongoDB

### macOS (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Windows
1. Download from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Start MongoDB service

### Verify Installation
```bash
# Check if MongoDB is running
mongosh
# or
mongo
```

## Step 2: Set Up Chat Service (Backend)

```bash
# Navigate to chat service directory
cd backend/chat-service

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env if needed (default settings should work)
# PORT=4000
# MONGODB_URI=mongodb://localhost:27017/connect_hub_chat
# FRONTEND_URL=http://localhost:3000

# Start the chat service
npm start
```

The chat service should now be running on http://localhost:4000

### Optional: Development Mode (auto-reload)
```bash
npm install -g nodemon
npm run dev
```

## Step 3: Set Up Frontend

```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies (if not already done)
npm install

# Create environment file
cp .env.local.example .env.local

# Ensure it contains:
# NEXT_PUBLIC_CHAT_SERVICE_URL=http://localhost:4000

# Start the frontend
npm run dev
```

The frontend should now be running on http://localhost:3000

## Step 4: Test the Chat Feature

1. **Open your browser** and go to http://localhost:3000

2. **Log in** with your existing account
   - If you don't have an account, sign up first

3. **Navigate to Chat**
   - Click "Chat" in the header navigation
   - Or go to http://localhost:3000/dashboard/chat

4. **Start a 1:1 Chat**
   - Click the message icon in the chat sidebar
   - Select a user from your community
   - Start messaging!

5. **Create a Group Chat**
   - Click the users icon in the chat sidebar
   - Enter a group name
   - Select members from your community
   - Click "Create Group"

6. **Send Different Message Types**
   - **Text**: Type and press Enter
   - **Image**: Click the image icon, select a file
   - **Voice**: Click the mic icon, record, and send

## Troubleshooting

### Chat service won't start

**Problem:** Port 4000 already in use
```bash
# Find and kill the process using port 4000
# macOS/Linux:
lsof -ti:4000 | xargs kill -9

# Windows:
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

**Problem:** MongoDB connection failed
```bash
# Check MongoDB status
brew services list | grep mongodb  # macOS
sudo systemctl status mongodb      # Linux

# Restart MongoDB
brew services restart mongodb-community  # macOS
sudo systemctl restart mongodb           # Linux
```

### Frontend can't connect to chat service

**Problem:** CORS errors in browser console

1. Check that chat service is running: http://localhost:4000/health
2. Verify `FRONTEND_URL` in backend `.env` is `http://localhost:3000`
3. Verify `NEXT_PUBLIC_CHAT_SERVICE_URL` in frontend `.env.local` is `http://localhost:4000`
4. Restart both services

### Images won't upload

**Problem:** "Failed to upload image"

1. Check file size (must be < 10MB)
2. Verify file format (PNG, JPG, GIF, WebP)
3. Check that `uploads/` directory exists in `backend/chat-service/`
4. Ensure chat service has write permissions

### Voice recording not working

**Problem:** "Failed to access microphone"

1. Grant microphone permissions in your browser
2. Check browser compatibility (Chrome, Firefox, Safari)
3. Note: getUserMedia requires HTTPS in production

## Verify Everything is Working

Run these checks:

1. **Chat Service Health Check**
   ```bash
   curl http://localhost:4000/health
   # Should return: {"status":"ok","service":"chat-service"}
   ```

2. **MongoDB Connection**
   ```bash
   mongosh
   use connect_hub_chat
   show collections
   # Should show: chatrooms, messages
   ```

3. **Frontend Environment**
   ```bash
   cd Frontend
   cat .env.local
   # Should contain: NEXT_PUBLIC_CHAT_SERVICE_URL=http://localhost:4000
   ```

## Next Steps

Now that chat is working:

1. **Invite team members** to test group chats
2. **Try voice calls** (click phone icon in chat header)
3. **Share images** in your conversations
4. **Check online status** of community members

## Architecture Overview

```
┌─────────────────────┐
│   Browser (3000)    │
│   Next.js Frontend  │
└──────────┬──────────┘
           │
           ├─── HTTP ───────► Spring Boot (8080)
           │                  User/Profile APIs
           │
           └─── WebSocket ──► Chat Service (4000)
                              Real-time Chat
                              ↓
                           MongoDB
                           Chat Data
```

## Production Deployment

For production, you'll need:

1. **MongoDB Atlas** or hosted MongoDB
2. **Cloud file storage** (Cloudinary/S3) instead of local uploads
3. **HTTPS** for voice/video features
4. **Environment variables** configured for production URLs

See [CHAT_FEATURE.md](./CHAT_FEATURE.md) for detailed production deployment guide.

## Support

If you encounter issues:

1. Check the logs:
   - Chat service: Terminal where you ran `npm start`
   - Frontend: Browser console (F12)
   - MongoDB: `tail -f /usr/local/var/log/mongodb/mongo.log` (macOS)

2. Verify all services are running:
   - MongoDB: port 27017
   - Chat service: port 4000
   - Frontend: port 3000
   - Spring Boot: port 8080

3. Review documentation:
   - [CHAT_FEATURE.md](./CHAT_FEATURE.md) - Full feature documentation
   - [backend/chat-service/README.md](./backend/chat-service/README.md) - API reference

## Common Commands

```bash
# Start all services
brew services start mongodb-community  # Start MongoDB
cd backend/chat-service && npm start   # Start chat service
cd Frontend && npm run dev             # Start frontend

# Stop all services
brew services stop mongodb-community   # Stop MongoDB
# Ctrl+C in chat service terminal
# Ctrl+C in frontend terminal

# View logs
tail -f backend/chat-service/logs/*.log
# Browser: F12 > Console
```

Enjoy chatting with your community! 🎉
