# Messaging UI Visual Description

This document describes what the messaging page looks like when implemented.

## Page Layout

### Header (Same as Home Page)
- **Top Navigation Bar** with:
  - ConnectHub logo on the left
  - Navigation buttons: Dashboard, My Community, **Messages** (active), Notifications
  - Theme toggle button
  - User profile dropdown on the right
  - Color: White background in light mode, dark gray in dark mode
  - Border at the bottom

### Main Content Area

The page has a **card layout** that fills the viewport below the header with a **split-pane design**:

## Left Panel: Conversations List (384px wide)

### Search Section (Top)
```
┌────────────────────────────────┐
│  🔍 Search conversations...    │
└────────────────────────────────┘
```
- Light gray input field with search icon
- Placeholder text: "Search conversations..."

### Conversations List (Below Search)
Each conversation item looks like:

```
┌────────────────────────────────┐
│  [👤]  John Smith              │
│        Hey, how are you?       │
│        12:30 PM            [2] │
├────────────────────────────────┤
│  [👤]  Sarah Johnson           │
│        See you tomorrow!       │
│        Yesterday               │
├────────────────────────────────┤
│  [👤]  Mike Davis              │
│        Thanks for your help    │
│        11/15                   │
└────────────────────────────────┘
```

**Elements per conversation:**
- **Avatar:** Circular profile picture (48px)
- **Name:** Bold, black text (or white in dark mode)
- **Last Message:** Gray text, truncated if too long
- **Time:** Small gray text on the right
- **Unread Badge:** Red/Purple circular badge with count (if unread messages exist)

**States:**
- Hover: Light gray background
- Selected: Slightly darker background with border highlight
- Normal: White/transparent background

**Empty State (No Conversations):**
```
┌────────────────────────────────┐
│                                │
│      No conversations yet.     │
│                                │
│  Connect with people to start  │
│         messaging!             │
│                                │
└────────────────────────────────┘
```

## Right Panel: Chat Area

### When No Conversation Selected
```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│          Select a conversation              │
│                                             │
│     Choose a contact to start messaging     │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```
- Centered text in gray
- Large main text, smaller subtitle

### When Conversation Selected

#### Chat Header
```
┌─────────────────────────────────────────────┐
│  [👤]  John Smith                           │
│        Student                              │
└─────────────────────────────────────────────┘
```
- Avatar (40px)
- Name in bold
- Profession in smaller gray text
- Border at bottom

#### Messages Area
```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌──────────────────┐                      │
│  │ Hi there!        │                      │
│  │ 11:30 AM         │                      │
│  └──────────────────┘                      │
│                                             │
│                       ┌──────────────────┐ │
│                       │ Hello! How are   │ │
│                       │ you?             │ │
│                       │ 11:35 AM         │ │
│                       └──────────────────┘ │
│                                             │
│  ┌──────────────────┐                      │
│  │ I'm doing great! │                      │
│  │ Thanks for asking│                      │
│  │ 11:36 AM         │                      │
│  └──────────────────┘                      │
│                                             │
└─────────────────────────────────────────────┘
```

**Received Messages (Left side):**
- Light gray background (#F1F5F9 in light mode)
- Dark text
- Rounded corners (16px)
- Max width: 70% of container
- Timestamp in small gray text

**Sent Messages (Right side):**
- Purple/Indigo gradient background (#6366F1 - Primary color)
- White text
- Rounded corners (16px)
- Max width: 70% of container
- Timestamp in small light text
- Right-aligned

#### Message Input Area (Bottom)
```
┌─────────────────────────────────────────────┐
│  [Type a message...              ] [Send▶] │
└─────────────────────────────────────────────┘
```
- Text input field (flexible width)
- Placeholder: "Type a message..."
- Send button with paper plane icon
- Purple background for send button
- Border at top

## Color Scheme

### Light Mode
- **Background:** `#FAFBFC` (light gray)
- **Card:** `#FFFFFF` (white)
- **Primary (sent messages):** `#6366F1` (indigo)
- **Secondary accent:** `#8B5CF6` (purple)
- **Received messages:** `#F1F5F9` (light gray)
- **Text:** `#1E293B` (dark gray)
- **Muted text:** `#64748B` (medium gray)
- **Border:** `#E2E8F0` (light gray)

### Dark Mode
- **Background:** `#0F172A` (dark slate)
- **Card:** `#1E293B` (dark gray)
- **Primary (sent messages):** `#818CF8` (lighter indigo)
- **Secondary accent:** `#A78BFA` (lighter purple)
- **Received messages:** `#334155` (medium dark)
- **Text:** `#F8FAFC` (light)
- **Muted text:** `#CBD5E1` (light gray)
- **Border:** `#334155` (dark gray)

## Responsive Behavior

### Desktop (≥768px)
- Both panels visible side-by-side
- Left panel: 384px fixed width
- Right panel: Flexible, fills remaining space

### Mobile (<768px)
- Single panel view
- Shows conversation list by default
- Clicking a conversation shows chat view
- Back button to return to list

## Interactive Elements

### Hover Effects
- Conversation items: Light background on hover
- Send button: Slightly darker shade on hover
- Search input: Border color change on focus

### Animations
- Smooth transitions on hover (200ms)
- Messages fade in when received
- Smooth scroll to bottom on new message
- Unread badge pulse/glow effect

### Loading States
- "Loading..." text when fetching data
- Skeleton loaders for conversation list (optional)

## Typography

- **Main headings:** 18-20px, bold (Space Grotesk font)
- **User names:** 14-16px, semi-bold
- **Message text:** 14px, regular (DM Sans font)
- **Timestamps:** 11-12px, regular
- **Placeholder text:** 14px, regular, muted color

## Spacing

- **Padding around page:** 16px
- **Gap between messages:** 16px
- **Padding inside message bubbles:** 12px horizontal, 8px vertical
- **Conversation item padding:** 16px
- **Input area padding:** 16px

## Icons

- **Search:** Magnifying glass icon
- **Send:** Paper plane/arrow icon
- **Profile:** Default avatar placeholder
- **Unread:** Small circular badge with number

## Accessibility

- Semantic HTML (header, main, section, etc.)
- ARIA labels for icon buttons
- Focus indicators on interactive elements
- Keyboard navigation support
- High contrast in both light and dark modes

---

## Visual Comparison to WhatsApp Web

The design closely resembles **WhatsApp Web** with:
- ✅ Left sidebar with conversation list
- ✅ Right panel with chat area
- ✅ Search at top of conversation list
- ✅ Message bubbles (gray for received, colored for sent)
- ✅ Timestamps in small text
- ✅ Input box at bottom with send button
- ✅ Unread message badges
- ✅ Last message preview

**Differences:**
- Uses ConnectHub's purple/indigo color scheme instead of WhatsApp green
- Matches existing UI components from home page
- Integrated with ConnectHub header/navigation

---

## Example User Flow

1. User clicks "Messages" in navigation
2. Page loads with conversation list on left
3. User sees list of connections with last message preview
4. User clicks on "John Smith" who has 2 unread messages
5. Right panel loads showing chat history
6. Unread badge (2) disappears as messages are marked read
7. User scrolls through previous messages
8. Page auto-scrolls to bottom showing latest messages
9. User types "Hello!" in input box
10. User presses Enter or clicks Send
11. Message appears on right side with purple background
12. John Smith sees message appear in real-time on his screen
13. Conversation list updates showing new last message and timestamp

This creates a seamless, real-time messaging experience similar to modern chat applications!
