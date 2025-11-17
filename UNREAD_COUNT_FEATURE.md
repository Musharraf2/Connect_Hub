# Unread Message Count in Navbar - Implementation Guide

## Feature Overview

The navbar now displays a **real-time unread message counter** next to the "Messages" link, similar to the notification badge for connection requests.

## Visual Example

### Before (no unread messages):
```
┌────────────────────────────────────────────────────────────┐
│ ConnectHub  [Dashboard] [Community] [Messages] [Notifications] │
└────────────────────────────────────────────────────────────┘
```

### After (with unread messages):
```
┌────────────────────────────────────────────────────────────┐
│ ConnectHub  [Dashboard] [Community] [Messages ③] [Notifications ①] │
└────────────────────────────────────────────────────────────┘
                                              ↑
                                    Red badge showing 3 unread messages
```

## How It Works

### 1. Initial Load
When the user logs in or visits any page:
- Frontend fetches total unread message count from backend
- Count is displayed as a red badge on the Messages link
- Badge only shows if count > 0

### 2. Real-Time Updates (WebSocket)
The system uses WebSocket to provide instant updates:

```
User A                    Backend                      User B
  │                          │                           │
  │                          │    ← sends message ───────┤
  │                          │                           │
  │  ← WebSocket push ───────┤                           │
  │  (new message)           │                           │
  │                          │                           │
  ├── Badge updates to 1     │                           │
  │   (no page refresh!)     │                           │
```

### 3. Reading Messages
When user opens a conversation:
- Messages are marked as read in the backend
- Unread count decrements by the number of messages read
- Badge updates automatically

```
Before opening chat:  [Messages ⑤]
After opening chat:   [Messages ②]  (if 3 messages were from that user)
```

## Technical Implementation

### Backend API

**New Endpoint:**
```java
GET /api/messages/unread-count/{userId}
Response: Long (count of unread messages)
```

**New Repository Query:**
```java
@Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.isRead = false")
Long countTotalUnreadMessages(@Param("userId") Long userId);
```

### Frontend Integration

**1. Header Component:**
```typescript
interface HeaderProps {
    user?: {
        id?: number
        name: string
        community: string
        avatar: string
        pendingRequests?: number
        unreadMessages?: number  // NEW
    }
}
```

**2. Badge Display:**
```tsx
<Button variant="ghost" size="sm" className="relative" asChild>
    <Link href="/messages" className="flex items-center space-x-2">
        <MessageCircle className="w-4 h-4" />
        <span>Messages</span>
        {user.unreadMessages && user.unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {user.unreadMessages}
            </span>
        )}
    </Link>
</Button>
```

**3. WebSocket Listener:**
```typescript
// Home page and other pages
stompClient.subscribe(`/user/${userId}/queue/messages`, () => {
    // Increment unread count when new message arrives
    setCurrentUser((prev) => 
        prev ? { ...prev, unreadMessages: (prev.unreadMessages || 0) + 1 } : null
    );
});
```

**4. Decrement on Read:**
```typescript
// Messages page
await markMessagesAsRead(currentUser.id, user.id);
setCurrentUser((prev) => 
    prev ? { 
        ...prev, 
        unreadMessages: Math.max(0, (prev.unreadMessages || 0) - unreadCount) 
    } : null
);
```

## User Experience

### Scenario 1: Receiving Messages
1. User A is on the Home page
2. User B sends a message to User A
3. **Instantly**, the navbar updates: `[Messages] → [Messages ①]`
4. No page reload required

### Scenario 2: Reading Messages
1. User A sees `[Messages ③]` in navbar
2. User A clicks Messages and opens the chat with User B
3. If User B sent 2 messages, navbar updates to `[Messages ①]`
4. Badge shows remaining unread messages from other users

### Scenario 3: Multiple Conversations
1. User B sends 2 messages → Badge shows `②`
2. User C sends 3 messages → Badge updates to `⑤`
3. User reads chat with User B → Badge updates to `③`
4. User reads chat with User C → Badge disappears (no unread messages)

## Benefits

✅ **Real-time**: Updates instantly via WebSocket
✅ **No Reload**: Works without page refresh
✅ **Accurate**: Tracks total unread messages across all conversations
✅ **User-friendly**: Clear visual indicator matching existing design
✅ **Consistent**: Same style as notification badge

## Testing Checklist

- [ ] Badge appears when there are unread messages
- [ ] Badge shows correct count
- [ ] Badge updates when new message arrives (no reload)
- [ ] Badge decrements when messages are read
- [ ] Badge disappears when count reaches 0
- [ ] Badge style matches notification badge
- [ ] Works across all pages (home, dashboard, profile, etc.)

## Code Files Modified

1. **Backend:**
   - `MessageRepository.java` - Added `countTotalUnreadMessages()` query
   - `MessageService.java` - Added `getTotalUnreadMessageCount()` method
   - `MessageController.java` - Added `/unread-count/{userId}` endpoint

2. **Frontend:**
   - `header.tsx` - Added unreadMessages prop and badge display
   - `home/page.tsx` - Added WebSocket listener for unread count
   - `messages/page.tsx` - Added decrement logic when reading messages
   - `api.ts` - Added `getUnreadMessageCount()` function

## Summary

The unread message count feature provides users with immediate visibility into new messages without requiring them to visit the Messages page. The implementation uses:

- **REST API** for initial count fetch
- **WebSocket** for real-time updates
- **Local state management** for instant UI updates
- **Badge component** for consistent visual design

This enhances the user experience by keeping them informed of new messages at all times, across all pages of the application.
