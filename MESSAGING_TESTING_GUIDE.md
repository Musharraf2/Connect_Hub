# Real-Time Messaging Feature - Testing Guide

## Overview
This document provides instructions for testing the real-time messaging feature that has been added to the ConnectHub application.

## Prerequisites
- MySQL database running on `localhost:3306` with database `professiondb`
- Backend server running on `http://localhost:8080`
- Frontend server running on `http://localhost:3000`

## Backend Setup

1. **Ensure MySQL is running** with the database configured in `application.properties`

2. **Start the backend server**:
   ```bash
   cd backend/profession-connect
   ./mvnw spring-boot:run
   ```

3. **Verify WebSocket endpoint**:
   - The WebSocket endpoint is available at: `http://localhost:8080/ws`
   - SockJS fallback is enabled for browser compatibility

## Frontend Setup

1. **Start the frontend development server**:
   ```bash
   cd Frontend
   npm run dev
   ```

2. **Access the application**:
   - Open `http://localhost:3000` in your browser
   - Log in with existing credentials

## Testing the Messaging Feature

### Step 1: Login with Two Different Users
1. Open the application in two different browser windows (or use incognito mode for the second user)
2. Log in with two different user accounts that are connected (have accepted connection)

### Step 2: Access Messages Page
1. In both browser windows, click on "Messages" in the navigation bar
2. You should see the messages page with:
   - Left sidebar: List of connected users
   - Right panel: Empty state saying "Select a conversation"

### Step 3: Start a Conversation
1. In User 1's window, click on User 2's name in the left sidebar
2. The right panel should show the chat interface
3. Type a message in the input box at the bottom
4. Press Enter or click the Send button

### Step 4: Verify Real-Time Delivery
1. In User 2's window, you should see:
   - User 1 appear in the conversation list (or move to the top)
   - An unread message count badge
2. Click on User 1's name
3. The message from User 1 should appear instantly
4. The unread count should disappear (messages marked as read)

### Step 5: Test Two-Way Communication
1. From User 2's window, send a reply
2. User 1 should receive the message in real-time without page refresh
3. The conversation list should update with the latest message

### Step 6: Test Search Functionality
1. In the search box at the top of the conversation list
2. Type part of a user's name
3. The list should filter to show only matching conversations

## Features Implemented

### UI/UX Features
- ✅ WhatsApp-like split-pane interface
- ✅ Left sidebar with conversation list
- ✅ Search conversations by user name
- ✅ Unread message count badges
- ✅ Last message preview in conversation list
- ✅ Message timestamps
- ✅ Auto-scroll to latest message
- ✅ Different styling for sent vs received messages
- ✅ Consistent color scheme with rest of application (purple/indigo theme)

### Backend Features
- ✅ WebSocket support with STOMP over SockJS
- ✅ Message persistence in database
- ✅ Query messages between users
- ✅ List all conversations with unread counts
- ✅ Mark messages as read
- ✅ Real-time message delivery via WebSocket subscriptions
- ✅ Only allow messaging between connected users

### Security
- ✅ Users can only message their accepted connections
- ✅ Messages are tied to authenticated user sessions
- ✅ WebSocket connections require user ID for subscription

## API Endpoints

### REST Endpoints

**Send Message**
```
POST /api/messages
Body: {
  "senderId": 1,
  "receiverId": 2,
  "content": "Hello!"
}
```

**Get Conversation**
```
GET /api/messages/conversation/{userId1}/{userId2}
Returns: Array of messages between the two users
```

**Get Conversation List**
```
GET /api/messages/conversations/{userId}
Returns: Array of conversation summaries with last message and unread count
```

**Mark Messages as Read**
```
PUT /api/messages/read/{receiverId}/{senderId}
```

### WebSocket Endpoints

**Connect**
```
WebSocket URL: ws://localhost:8080/ws
Protocol: STOMP over SockJS
```

**Subscribe to Messages**
```
Destination: /queue/messages/{userId}
Receives: Real-time message notifications
```

**Send Message**
```
Destination: /app/chat.send
Body: {
  "senderId": 1,
  "receiverId": 2,
  "content": "Hello!"
}
```

## Database Schema

### Messages Table
```sql
CREATE TABLE messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sender_id BIGINT NOT NULL,
  receiver_id BIGINT NOT NULL,
  content VARCHAR(5000) NOT NULL,
  timestamp DATETIME NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);
```

## Troubleshooting

### Messages not appearing in real-time
- Check browser console for WebSocket connection errors
- Verify backend server is running on port 8080
- Check that CORS is properly configured

### Cannot send messages
- Verify users are connected (status: ACCEPTED)
- Check network tab for API request failures
- Verify authentication token in session storage

### Conversation list is empty
- Ensure users have accepted connections
- Try sending a message via REST API to verify backend functionality

## Code Structure

### Backend
```
backend/profession-connect/src/main/java/com/community/profession_connect/
├── config/
│   └── WebSocketConfig.java         # WebSocket configuration
├── controller/
│   └── MessageController.java       # REST and WebSocket endpoints
├── dto/
│   ├── MessageRequest.java          # Message send request
│   ├── MessageResponse.java         # Message response
│   └── ConversationSummary.java     # Conversation list item
├── model/
│   └── Message.java                 # Message entity
├── repository/
│   └── MessageRepository.java       # Message data access
└── service/
    └── MessageService.java          # Business logic
```

### Frontend
```
Frontend/
├── app/
│   └── messages/
│       └── page.tsx                 # Main messages page
├── components/
│   └── ui/
│       └── scroll-area.tsx          # Scroll area component
└── lib/
    └── api.ts                       # API functions (extended)
```

## Next Steps

If you need to extend this feature:

1. **Add file sharing**: Extend Message model to include file URLs
2. **Add emoji support**: Install emoji picker library
3. **Add typing indicators**: Use WebSocket to broadcast typing status
4. **Add message reactions**: Create reaction table and UI
5. **Add message deletion**: Add soft delete functionality
6. **Add group messaging**: Create group chat tables and logic
7. **Add notifications**: Integrate with existing notification system
8. **Add voice messages**: Add audio recording and playback
9. **Add read receipts**: Show when messages are seen
10. **Add message search**: Full-text search within conversations
