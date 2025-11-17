# Messaging Feature - Quick Start Guide

## Prerequisites
Before testing the messaging feature, ensure you have:
1. Backend server running on `http://localhost:8080`
2. Frontend server running on `http://localhost:3000`
3. MySQL database configured and running
4. At least two user accounts created
5. Users are connected (have accepted connection requests)

## Starting the Application

### Backend (Spring Boot)
```bash
cd backend/profession-connect
mvn spring-boot:run
```

### Frontend (Next.js)
```bash
cd Frontend
npm run dev
```

## Testing the Messaging Feature

### Step 1: Log in with First User
1. Open browser and navigate to `http://localhost:3000`
2. Log in with User A credentials
3. Click on "Messages" in the navbar

### Step 2: View Connections
- You will see a list of your connections on the left sidebar
- Each connection shows:
  - User avatar
  - User name
  - Last message preview
  - Unread message count (if any)

### Step 3: Start a Conversation
1. Click on a connection from the list
2. The chat area will open on the right side
3. Previous message history (if any) will load automatically

### Step 4: Send Messages
1. Type your message in the text area at the bottom
2. Press Enter or click the Send button
3. Your message will appear immediately in the chat
4. The message bubble will be blue (primary color) for your messages

### Step 5: Test Real-Time Delivery
1. Open another browser window (or incognito mode)
2. Log in with User B (the person you're messaging)
3. Navigate to Messages
4. Click on User A's conversation
5. Type a message from User B
6. Watch as the message appears instantly in User A's window!

## Features Demonstrated

### Real-Time Messaging
- Messages appear instantly without page refresh
- Uses WebSocket connection for real-time delivery
- Both users can see messages as they're sent

### Message History
- Previous conversations are loaded from the database
- Scrollable message history
- Messages show timestamp and sender

### Unread Counts
- Unread message count shown in the user list
- Count updates in real-time
- Automatically marks messages as read when opening chat

### Search Functionality
- Search bar to filter conversations
- Type user name to find specific chats

### UI Features
- WhatsApp-like split layout
- Responsive design for mobile/desktop
- Matches existing application theme
- Smooth scrolling to latest messages
- Message bubbles with different colors for sent/received

## Troubleshooting

### Messages Not Sending
1. Check browser console for errors
2. Verify WebSocket connection is established (should see "WebSocket connected" in console)
3. Ensure users are connected (accepted connection)
4. Check backend logs for errors

### WebSocket Not Connecting
1. Verify backend is running on port 8080
2. Check CORS configuration in WebSocketConfig.java
3. Clear browser cache and reload

### No Connections Showing
1. Ensure users have sent and accepted connection requests
2. Check the Home page -> Dashboard to send connection requests
3. Check Notifications page to accept pending requests

## Expected Behavior

### When Opening Messages Page
- See list of all accepted connections
- Last message preview for each conversation
- Unread count badge if there are unread messages

### When Selecting a Conversation
- Previous messages load and display
- Scrolls to latest message
- Unread count clears
- Can immediately start typing and sending messages

### When Receiving a Message
- Message appears in real-time in the chat area (if chat is open)
- Unread count increases (if chat is closed)
- Last message preview updates in user list

### Message Appearance
- Your messages: Blue bubbles on the right
- Received messages: Gray bubbles on the left
- Timestamp below each message
- Smooth animations and transitions

## Architecture Overview

### Backend Flow
1. User sends message via REST API or WebSocket
2. MessageService validates connection between users
3. Message saved to database
4. WebSocket broadcasts message to receiver
5. Receiver's UI updates in real-time

### Frontend Flow
1. User types message and clicks Send
2. Frontend calls sendMessage API
3. Message saved and confirmation received
4. WebSocket subscription receives message
5. UI updates to show new message
6. Scroll to bottom of chat area

## Database Schema

The `messages` table stores:
- `id`: Primary key
- `sender_id`: Foreign key to users table
- `receiver_id`: Foreign key to users table
- `content`: Message text
- `timestamp`: When message was sent
- `is_read`: Boolean indicating read status

## API Endpoints Used

### REST Endpoints
- `POST /api/messages/send` - Send a message
- `GET /api/messages/history/{userId1}/{userId2}` - Get conversation history
- `GET /api/messages/chat-users/{userId}` - Get list of connections
- `PUT /api/messages/mark-read` - Mark messages as read

### WebSocket Endpoints
- `/ws` - WebSocket connection endpoint
- `/app/chat` - Send message via WebSocket
- `/user/{userId}/queue/messages` - Receive messages

## UI Components

### Header
- Same navbar as home page
- Messages link highlights when active
- User avatar and profile menu

### Left Sidebar (User List)
- Search bar for filtering
- List of connections
- Avatar, name, last message preview
- Unread count badge

### Right Chat Area
- Chat header with user info
- Scrollable message history
- Message input with send button
- Real-time message updates

## Color Scheme
- Primary: #6366f1 (Indigo) - Used for sent messages
- Secondary: #8b5cf6 (Purple) - Accent colors
- Muted: #f1f5f9 - Received message bubbles
- Border: #e2e8f0 - Card borders

Enjoy using the real-time messaging feature!
