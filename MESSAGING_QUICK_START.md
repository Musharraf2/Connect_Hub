# Real-Time Messaging Feature - Quick Start

## What's New?
A WhatsApp-like real-time messaging system has been added to ConnectHub, allowing users to chat with their connected contacts.

## Key Features
✅ Real-time bidirectional messaging  
✅ WhatsApp-style split-pane interface  
✅ Unread message count badges  
✅ Last message preview in conversation list  
✅ Search conversations  
✅ Auto-scroll to latest message  
✅ Message timestamps  
✅ Only message your accepted connections  
✅ Messages persist in database  
✅ Responsive design (works on mobile and desktop)  

## Quick Setup

### Prerequisites
- MySQL database running
- Java 17 or higher
- Node.js 18 or higher

### Backend Setup (2 minutes)
```bash
cd backend/profession-connect

# The WebSocket dependency has been added to pom.xml
# The database tables will be created automatically on first run

# Start the backend
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080` with WebSocket endpoint at `/ws`

### Frontend Setup (1 minute)
```bash
cd Frontend

# Dependencies already installed (sockjs-client, @stomp/stompjs)
# Start the development server
npm run dev
```

The frontend will start on `http://localhost:3000`

## How to Use

### Step 1: Login
1. Open `http://localhost:3000`
2. Login with your credentials

### Step 2: Go to Messages
1. Click "Messages" in the navigation bar
2. You'll see a list of your connections on the left

### Step 3: Start Chatting
1. Click on a contact name
2. Type your message in the input box at the bottom
3. Press Enter or click Send
4. Your contact will receive the message instantly!

## Architecture Overview

```
┌──────────────┐      WebSocket       ┌──────────────┐
│   Frontend   │◄────────────────────►│   Backend    │
│  (React/     │      (STOMP)         │  (Spring     │
│   Next.js)   │                      │   Boot)      │
└──────────────┘                      └──────┬───────┘
                                             │
                                             ▼
                                      ┌─────────────┐
                                      │    MySQL    │
                                      │  Database   │
                                      └─────────────┘
```

## Technology Stack

**Backend:**
- Spring Boot 3.5.4
- Spring WebSocket (STOMP over SockJS)
- Spring Data JPA
- MySQL Database
- Lombok

**Frontend:**
- Next.js 15.2.4
- React 19
- TypeScript
- Tailwind CSS
- STOMP.js + SockJS Client

## Database Changes

The following table is automatically created:

```sql
messages
├── id (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
├── sender_id (BIGINT, FOREIGN KEY → users.id)
├── receiver_id (BIGINT, FOREIGN KEY → users.id)
├── content (VARCHAR(5000))
├── timestamp (DATETIME)
└── is_read (BOOLEAN)
```

## API Endpoints

**WebSocket Connection:**
```
ws://localhost:8080/ws
```

**Subscribe to Messages (per user):**
```
/queue/messages/{userId}
```

**REST Endpoints:**
- `POST /api/messages` - Send a message
- `GET /api/messages/conversation/{userId1}/{userId2}` - Get message history
- `GET /api/messages/conversations/{userId}` - Get conversation list
- `PUT /api/messages/read/{receiverId}/{senderId}` - Mark messages as read

## Files Modified/Created

### Backend
```
✓ backend/profession-connect/pom.xml
✓ .../config/WebSocketConfig.java          (NEW)
✓ .../controller/MessageController.java    (NEW)
✓ .../dto/MessageRequest.java             (NEW)
✓ .../dto/MessageResponse.java            (NEW)
✓ .../dto/ConversationSummary.java        (NEW)
✓ .../model/Message.java                  (NEW)
✓ .../repository/MessageRepository.java    (NEW)
✓ .../repository/ConnectionRepository.java (UPDATED)
✓ .../service/MessageService.java         (NEW)
```

### Frontend
```
✓ Frontend/app/messages/page.tsx          (NEW)
✓ Frontend/components/ui/scroll-area.tsx  (NEW)
✓ Frontend/lib/api.ts                     (UPDATED)
✓ Frontend/package.json                   (UPDATED)
```

## Verification Checklist

After starting both servers:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can login to the application
- [ ] "Messages" link appears in navigation bar
- [ ] Messages page loads without errors
- [ ] Can see list of connected users
- [ ] Can select a user and see empty chat
- [ ] Can send a message
- [ ] Message appears in chat area
- [ ] Open another browser (incognito) and login as another user
- [ ] Second user can see the message in real-time
- [ ] Unread count appears for second user
- [ ] Clicking conversation marks messages as read

## Troubleshooting

**"No conversations yet" message:**
- Make sure you have accepted connections with other users
- Messages only work between connected users

**Messages not sending:**
- Check browser console for errors
- Verify backend is running on port 8080
- Check MySQL connection

**Real-time not working:**
- Check WebSocket connection in browser DevTools → Network → WS
- Verify WebSocket endpoint is accessible
- Check for CORS issues

## Support Files

For more detailed information, see:
- `MESSAGING_TESTING_GUIDE.md` - Comprehensive testing instructions
- `MESSAGING_UI_SPEC.md` - UI design specification and layout details

## Next Steps

The messaging feature is fully functional and ready to use. Possible enhancements:
- File/image sharing
- Emoji picker
- Typing indicators
- Message reactions
- Voice messages
- Group chats
- Message search

## Security Notes

✅ Users can only message their accepted connections  
✅ Messages are persisted securely in the database  
✅ WebSocket connections are tied to user sessions  
✅ Input validation on both frontend and backend  
✅ SQL injection protection via JPA/Hibernate  
✅ XSS protection via React's built-in escaping  

---

**That's it! The messaging feature is ready to use. Happy chatting! 💬**
