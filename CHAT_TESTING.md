# Integration Testing Guide - Community Chat

This document describes how to test the complete chat feature integration.

## Test Environment Setup

### 1. Start All Services

Open 4 terminal windows:

**Terminal 1 - MongoDB:**
```bash
# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongodb           # Linux

# Verify
mongosh
```

**Terminal 2 - Spring Boot API:**
```bash
cd backend/profession-connect
./mvnw spring-boot:run
```

**Terminal 3 - Chat Service:**
```bash
cd backend/chat-service
npm start
```

**Terminal 4 - Frontend:**
```bash
cd Frontend
npm run dev
```

### 2. Verify Services

Run the health check script:
```bash
./check-chat-setup.sh
```

All services should show ✓ Running.

## Test Scenarios

### Scenario 1: User Authentication & Navigation

**Steps:**
1. Open http://localhost:3000
2. Click "Sign Up" or "Login"
3. Create account or log in with existing credentials
4. Verify redirect to dashboard
5. Click "Chat" in header navigation
6. Verify redirect to `/dashboard/chat`

**Expected Results:**
- ✅ Login successful
- ✅ Dashboard loads with user profile
- ✅ Chat page loads with empty state
- ✅ Sidebar shows "No chats yet"

### Scenario 2: Starting a 1:1 Chat

**Prerequisites:** Two user accounts in the same community

**Steps:**
1. User A logs in and goes to Chat
2. Click message icon in sidebar
3. See list of community members
4. Select User B from the list
5. Type "Hello!" and press Enter
6. User B logs in (different browser/incognito)
7. User B goes to Chat
8. Verify User B sees the chat with User A
9. User B types "Hi back!" and sends

**Expected Results:**
- ✅ Chat room created instantly
- ✅ Message appears immediately for sender
- ✅ Message received in real-time by recipient
- ✅ Typing indicator shows while typing
- ✅ Read receipt shows after viewing

**Test in Browser DevTools:**
```javascript
// Check Socket connection
window.io  // Should show Socket instance

// Check messages in MongoDB
// In mongosh:
use connect_hub_chat
db.messages.find().pretty()
```

### Scenario 3: Group Chat Creation

**Steps:**
1. User A goes to Chat
2. Click users icon in sidebar
3. Enter group name "Study Group"
4. Select 2-3 members from community
5. Click "Create Group"
6. Send a message in the group
7. Selected members log in
8. Verify they see the group chat

**Expected Results:**
- ✅ Group chat created
- ✅ All members can see the group
- ✅ All members receive messages
- ✅ Member count shows correctly
- ✅ Group name displays in sidebar

### Scenario 4: Image Upload

**Steps:**
1. In an open chat, click image icon
2. Select an image file (PNG, JPG, < 10MB)
3. Preview appears in dialog
4. Click "Send"
5. Verify image appears in chat
6. Recipient sees image immediately

**Expected Results:**
- ✅ Image preview works
- ✅ Upload progress indicator shows
- ✅ Image displays in chat bubble
- ✅ Image is clickable/zoomable
- ✅ Image persists after page reload

**Verify Upload:**
```bash
# Check uploaded file
ls -la backend/chat-service/uploads/
```

### Scenario 5: Voice Message

**Steps:**
1. In an open chat, click microphone icon
2. Click record button
3. Speak for 5 seconds
4. Click stop recording
5. Preview audio playback
6. Click "Send"
7. Recipient receives voice message
8. Recipient plays voice message

**Expected Results:**
- ✅ Microphone permission requested
- ✅ Recording indicator shows
- ✅ Timer counts up during recording
- ✅ Audio preview plays correctly
- ✅ Voice message appears in chat
- ✅ Recipient can play voice message

**Browser Compatibility:**
- Chrome: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (may need HTTPS)
- Edge: ✅ Full support

### Scenario 6: Typing Indicators

**Steps:**
1. User A and User B in same chat
2. User A starts typing
3. User B sees "User A is typing..."
4. User A stops typing (waits 1 second)
5. Typing indicator disappears
6. User A sends message

**Expected Results:**
- ✅ Typing indicator appears < 500ms
- ✅ Multiple users typing shows "User A, User B are typing..."
- ✅ Indicator disappears after 1 second of inactivity
- ✅ Indicator disappears when message sent

### Scenario 7: Read Receipts

**Steps:**
1. User A sends message to User B
2. Message shows single checkmark (✓)
3. User B opens the chat
4. Message automatically marked as read
5. User A sees double checkmark (✓✓)

**Expected Results:**
- ✅ Single checkmark for sent
- ✅ Double checkmark for read
- ✅ Read receipts persist after reload
- ✅ Read status shows in message info

### Scenario 8: Online/Offline Status

**Steps:**
1. User A and User B both online
2. Check User B's status in User A's chat
3. User B closes browser/logs out
4. User A sees "offline" status
5. User B logs back in
6. User A sees "online" status

**Expected Results:**
- ✅ Green dot for online users
- ✅ Gray dot for offline users
- ✅ Last seen timestamp for offline users
- ✅ Status updates in real-time

### Scenario 9: WebRTC Voice Call (Basic)

**Note:** Full voice call testing requires WebRTC setup

**Steps:**
1. User A clicks phone icon in chat header
2. Call initiation request sent
3. User B receives call notification
4. User B clicks answer
5. Call connects

**Expected Results:**
- ✅ Call notification appears
- ✅ Signaling data exchanged
- ✅ ICE candidates exchanged
- ✅ Call can be ended

**WebRTC Console Checks:**
```javascript
// In browser console during call
// Check peer connection
window.peerConnection
window.peerConnection.connectionState
```

### Scenario 10: Multi-Device Support

**Steps:**
1. User A logs in on two browsers
2. Send message from Browser 1
3. Verify message appears in Browser 2
4. Send message from Browser 2
5. Verify appears in Browser 1

**Expected Results:**
- ✅ Messages sync across devices
- ✅ Read receipts sync
- ✅ Chat list updates on all devices

## Performance Tests

### Load Testing

**Test 1: Many Messages**
```javascript
// Send 100 messages rapidly
for (let i = 0; i < 100; i++) {
  // Send message via UI
}
```
**Expected:** All messages delivered in order, no lag

**Test 2: Large Image**
- Upload 9MB image
- **Expected:** Upload completes in < 10 seconds

**Test 3: Multiple Concurrent Chats**
- Open 5 different chats
- Switch between them rapidly
- **Expected:** Smooth transitions, no data loss

## Data Persistence Tests

### Test 1: Page Reload
1. Send 10 messages
2. Reload page
3. **Expected:** All messages still visible

### Test 2: Browser Restart
1. Create 3 chats, send messages
2. Close browser completely
3. Reopen and log in
4. **Expected:** All chats and messages intact

### Test 3: Service Restart
1. Stop chat service (`Ctrl+C`)
2. Restart chat service (`npm start`)
3. **Expected:** Messages still in database, chats resume

```bash
# Verify data in MongoDB
mongosh
use connect_hub_chat
db.chatrooms.find().count()  # Count chat rooms
db.messages.find().count()   # Count messages
```

## Error Handling Tests

### Test 1: Network Disconnect
1. Send message
2. Disable network
3. Try to send another message
4. **Expected:** Error notification, message queued

### Test 2: File Too Large
1. Try to upload 15MB image
2. **Expected:** Error message "File too large"

### Test 3: Invalid File Type
1. Try to upload .exe file
2. **Expected:** Error message "Invalid file type"

### Test 4: Chat Service Down
1. Stop chat service
2. Try to send message
3. **Expected:** Error notification, graceful fallback

## Security Tests

### Test 1: Community Isolation
1. User from "student" community
2. User from "teacher" community
3. **Expected:** Cannot see each other in user lists

### Test 2: Unauthorized Access
1. Try to access chat without login
2. **Expected:** Redirect to login page

### Test 3: File Upload Validation
1. Try XSS in filename
2. Try path traversal in filename
3. **Expected:** Sanitized and safe

## Debugging Tips

### View Socket Events
```javascript
// In browser console
const socket = window.io?.socket;
socket.onAny((event, ...args) => {
  console.log('Socket event:', event, args);
});
```

### View MongoDB Data
```bash
mongosh
use connect_hub_chat

# View all chat rooms
db.chatrooms.find().pretty()

# View recent messages
db.messages.find().sort({createdAt: -1}).limit(10).pretty()

# Count by message type
db.messages.aggregate([
  { $group: { _id: "$messageType", count: { $sum: 1 } } }
])
```

### View Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "WS" for WebSocket
4. Check Socket.io connection

### View Console Logs

**Chat Service:**
```bash
tail -f backend/chat-service/logs/app.log
```

**Frontend:**
- Browser console (F12 > Console)

## Test Checklist

Use this checklist for complete testing:

**Authentication & Navigation:**
- [ ] Sign up works
- [ ] Login works
- [ ] Navigate to chat page
- [ ] User profile loads

**1:1 Chat:**
- [ ] Create direct chat
- [ ] Send text message
- [ ] Receive message in real-time
- [ ] Messages persist after reload

**Group Chat:**
- [ ] Create group
- [ ] Add multiple members
- [ ] Send group message
- [ ] All members receive

**Media:**
- [ ] Upload image
- [ ] Send voice message
- [ ] Preview media
- [ ] Media persists

**Real-time Features:**
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Online/offline status
- [ ] Message delivered instantly

**Error Handling:**
- [ ] File too large error
- [ ] Invalid file type error
- [ ] Network error handling
- [ ] Service unavailable handling

**Performance:**
- [ ] 100+ messages load quickly
- [ ] Large file upload works
- [ ] Multiple chats switch smoothly
- [ ] No memory leaks

## Conclusion

If all tests pass:
✅ Chat feature is fully functional
✅ Ready for production deployment
✅ All edge cases handled

If any tests fail:
1. Check service logs
2. Verify environment variables
3. Review browser console
4. Check MongoDB data
5. Refer to TROUBLESHOOTING.md
