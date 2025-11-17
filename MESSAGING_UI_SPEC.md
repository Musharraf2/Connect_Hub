# Messaging Feature - UI Design Specification

## Overview
The messaging page follows a WhatsApp-like design with a split-pane interface that matches the existing ConnectHub color scheme.

## Color Scheme
- Primary color: Indigo/Purple (`#6366f1` / `#8b5cf6`)
- Background: Light gray in light mode (`#fafbfc`), Dark slate in dark mode (`#0f172a`)
- Card background: White in light mode, Dark gray in dark mode
- Message bubbles: 
  - Sent messages: Primary color background with white text
  - Received messages: Muted background with dark text

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         Header/Navbar                           │
│  (Same as home page - includes logo, navigation, user menu)     │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                       Main Container                            │
│  ┌──────────────────┬─────────────────────────────────────────┐ │
│  │                  │                                         │ │
│  │   Left Sidebar   │         Right Panel (Chat Area)        │ │
│  │   (Conversations)│                                         │ │
│  │                  │                                         │ │
│  │  ┌────────────┐  │  ┌───────────────────────────────────┐ │ │
│  │  │ Search Box │  │  │     Chat Header                   │ │ │
│  │  └────────────┘  │  │  Avatar + Name + Profession       │ │ │
│  │                  │  └───────────────────────────────────┘ │ │
│  │  User 1 ●        │                                         │ │
│  │  Last message... │  ┌───────────────────────────────────┐ │ │
│  │  12:30 PM        │  │                                   │ │ │
│  │                  │  │    Messages Area (Scrollable)     │ │ │
│  │  User 2          │  │                                   │ │ │
│  │  Last message... │  │  ┌──────────────────┐            │ │ │
│  │  Yesterday       │  │  │ Received message │            │ │ │
│  │                  │  │  │ 11:30 AM         │            │ │ │
│  │  User 3          │  │  └──────────────────┘            │ │ │
│  │  Last message... │  │                                   │ │ │
│  │  11/15           │  │            ┌──────────────────┐  │ │ │
│  │                  │  │            │ Sent message     │  │ │ │
│  │                  │  │            │ 11:35 AM         │  │ │ │
│  │                  │  │            └──────────────────┘  │ │ │
│  │                  │  │                                   │ │ │
│  │                  │  └───────────────────────────────────┘ │ │
│  │                  │                                         │ │
│  │                  │  ┌───────────────────────────────────┐ │ │
│  │                  │  │  Message Input                    │ │ │
│  │                  │  │  [Type a message...     ] [Send]  │ │ │
│  │                  │  └───────────────────────────────────┘ │ │
│  └──────────────────┴─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### Left Sidebar (Conversation List)
**Width**: 384px (md:w-96) on desktop, full width on mobile
**Features**:
- Search input at the top with search icon
- Scrollable list of conversations
- Each conversation item shows:
  - User avatar (circular, 48px diameter)
  - User name (bold, truncated if too long)
  - Last message preview (truncated, gray text)
  - Timestamp (right-aligned, gray text)
  - Unread count badge (if unread messages > 0)
    - Circular badge with primary color background
    - White text showing count
    - 20px diameter

**States**:
- Hover: Light background highlight
- Selected: Slightly darker background
- Empty state: Centered message "No conversations yet"

### Right Panel (Chat Area)

#### Chat Header
**Height**: ~72px
**Content**:
- User avatar (40px diameter)
- User name (bold, black text)
- User profession (gray text, smaller font)

#### Messages Area
**Features**:
- Scrollable container with padding
- Auto-scrolls to bottom when new message arrives
- Messages aligned based on sender:
  - Received messages: Left-aligned
  - Sent messages: Right-aligned
- Each message bubble contains:
  - Message text (word-wrap enabled)
  - Timestamp (small, gray or light text)
  - Max width: 70% of container

**Message Styling**:
- Received messages:
  - Background: Light gray/muted
  - Text: Dark
  - Border radius: 16px (rounded-2xl)
  - Padding: 12px horizontal, 8px vertical
  
- Sent messages:
  - Background: Primary color (indigo/purple)
  - Text: White
  - Border radius: 16px (rounded-2xl)
  - Padding: 12px horizontal, 8px vertical

#### Message Input
**Height**: ~72px
**Content**:
- Text input field (flexible width)
  - Placeholder: "Type a message..."
  - Border: Standard input border
  - Rounded corners
- Send button (square, icon only)
  - Icon: Paper plane/send icon
  - Primary color background
  - Triggers on click or Enter key

### Empty State (No Conversation Selected)
**Display**: Centered in right panel
**Content**:
- Large text: "Select a conversation"
- Small text: "Choose a contact to start messaging"
- Gray/muted colors

## Responsive Behavior

### Desktop (≥768px)
- Split view with both panels visible
- Left sidebar fixed at 384px width
- Right panel takes remaining space

### Mobile (<768px)
- Single panel view
- Shows conversation list by default
- Clicking a conversation navigates to chat view
- Back button to return to conversation list

## Interactions

### Search
- Real-time filtering as user types
- Case-insensitive search
- Searches user names only

### Sending Messages
- Click send button or press Enter
- Input clears after sending
- Message appears immediately
- Scroll to bottom automatically

### Receiving Messages
- Messages appear in real-time (WebSocket)
- Visual indication (unread badge) in conversation list
- Opening conversation marks messages as read
- Unread badge disappears

### Keyboard Shortcuts
- Enter: Send message
- Shift+Enter: New line (if textarea is used)

## Accessibility
- Semantic HTML structure
- ARIA labels for icons
- Keyboard navigation support
- Focus management
- Screen reader friendly

## Animation/Transitions
- Smooth hover effects on conversation items
- Fade-in for new messages
- Smooth scroll to bottom
- Loading states where appropriate

## Integration with Existing Design
- Uses same header component as home page
- Matches color scheme from globals.css
- Uses same UI components (Button, Input, Avatar, Card, etc.)
- Consistent spacing and typography
- Same rounded corners and shadows
- Dark mode support

## Technical Notes
- Real-time updates via WebSocket (STOMP over SockJS)
- Messages persist in database
- Only connected users appear in conversation list
- Timestamps use local timezone
- Unread count updates in real-time
- Optimistic UI updates (message appears before server confirmation)
