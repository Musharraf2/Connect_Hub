# Real-Time Messaging Feature

## Overview
This feature implements a WhatsApp Web-like real-time messaging interface that allows users to chat with their accepted connections.

## Features

### Backend (Spring Boot)
- **WebSocket Integration**: Uses Spring WebSocket with STOMP protocol for real-time communication
- **Message Persistence**: Messages are stored in MySQL database with the following schema:
  - Message ID
  - Sender ID (User reference)
  - Receiver ID (User reference)
  - Content
  - Timestamp
  - Read status
- **REST API Endpoints**:
  - `POST /api/messages/send` - Send a message
  - `GET /api/messages/history/{userId1}/{userId2}` - Get message history
  - `GET /api/messages/chat-users/{userId}` - Get all chat connections
  - `PUT /api/messages/mark-read` - Mark messages as read
- **WebSocket Endpoint**:
  - `/app/chat` - Send messages in real-time
  - `/user/{userId}/queue/messages` - Receive messages

### Frontend (Next.js)
- **WhatsApp-like UI**: Split layout with user list on the left and chat area on the right
- **Real-time Updates**: Messages appear instantly using WebSocket connection
- **Message History**: Loads previous conversations from the database
- **Unread Count**: Shows unread message count for each conversation
- **Search**: Filter conversations by user name
- **Responsive Design**: Works on desktop and mobile devices

## Installation

### Backend Setup
1. Ensure MySQL database is running
2. The messaging tables will be created automatically via JPA
3. WebSocket dependencies are already added to `pom.xml`

### Frontend Setup
1. Dependencies are already installed:
   ```bash
   npm install sockjs-client @stomp/stompjs @types/sockjs-client
   ```

## Usage

1. **Log in** to the application
2. **Connect with other users** by sending connection requests
3. Navigate to **Messages** from the navbar
4. Select a conversation from the left sidebar
5. Type your message and press Enter or click Send
6. Messages will appear in real-time for both sender and receiver

## Technical Details

### WebSocket Configuration
- **STOMP over SockJS**: Provides fallback options for browsers without WebSocket support
- **Message Broker**: Simple in-memory broker for pub/sub messaging
- **Destination Prefixes**:
  - `/app` - Application destination prefix for client-to-server messages
  - `/topic` - Topic for broadcast messages
  - `/queue` - Queue for point-to-point messages

### Security Considerations
- Users can only message their accepted connections
- Message validation ensures sender/receiver relationship exists
- CORS is configured to allow frontend origin (http://localhost:3000)

## UI Components

### Messages Page Structure
```
┌─────────────────────────────────────────────────────┐
│              Header (Navbar)                         │
├──────────────────┬──────────────────────────────────┤
│                  │                                   │
│  User List       │     Chat Area                     │
│  (Left Side)     │     (Right Side)                  │
│                  │                                   │
│  - Search        │  - Chat Header                    │
│  - Connection 1  │  - Messages                       │
│  - Connection 2  │  - Message Input                  │
│  - Connection 3  │                                   │
│  ...             │                                   │
│                  │                                   │
└──────────────────┴──────────────────────────────────┘
```

### Color Scheme
Matches the existing application theme:
- Primary: #6366f1 (Indigo)
- Secondary: #8b5cf6 (Purple)
- Message bubbles: Primary for sent, Muted for received

## Future Enhancements
- File/image sharing
- Message reactions
- Typing indicators
- Online/offline status
- Message deletion
- Group messaging
- Voice/video calls

## Troubleshooting

### WebSocket Connection Issues
- Ensure backend is running on `http://localhost:8080`
- Check CORS configuration in `WebSocketConfig.java`
- Verify WebSocket endpoint `/ws` is accessible

### Messages Not Appearing
- Check browser console for WebSocket errors
- Ensure users are connected (accepted connection)
- Verify database connection and Message table exists

### Build Errors
- Frontend: Run `npm install` to ensure all dependencies are installed
- Backend: Run `mvn clean install` to rebuild with WebSocket dependencies
