# Community Chat Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Frontend (Next.js - Port 3000)               │  │
│  │                                                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │   Chat      │  │   Chat      │  │   Chat      │      │  │
│  │  │  Sidebar    │  │    Area     │  │    Info     │      │  │
│  │  │             │  │             │  │             │      │  │
│  │  │ - Users     │  │ - Messages  │  │ - Members   │      │  │
│  │  │ - Groups    │  │ - Input     │  │ - Media     │      │  │
│  │  │ - Search    │  │ - Upload    │  │ - Actions   │      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│  │                                                            │  │
│  │              Socket.io Context Provider                   │  │
│  │              Chat API Service Layer                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                        │              │                          │
└────────────────────────┼──────────────┼──────────────────────────┘
                         │              │
                    WebSocket        HTTP/REST
                         │              │
         ┌───────────────┴──────────────┴─────────────┐
         │                                             │
         │                                             │
┌────────▼──────────┐                    ┌────────────▼────────┐
│  Chat Service     │                    │   Spring Boot API   │
│  (Port 4000)      │                    │   (Port 8080)       │
│                   │                    │                     │
│  ┌──────────────┐ │                    │  ┌────────────────┐│
│  │  Socket.io   │ │                    │  │ User Service   ││
│  │   Server     │ │                    │  ├────────────────┤│
│  ├──────────────┤ │                    │  │ Connection API ││
│  │  Express     │ │                    │  ├────────────────┤│
│  │  REST API    │ │                    │  │ Profile API    ││
│  └──────────────┘ │                    │  └────────────────┘│
│         │          │                    │         │          │
│         │          │                    │         │          │
│    ┌────▼────┐     │                    │    ┌────▼────┐    │
│    │ MongoDB │     │                    │    │  MySQL  │    │
│    │         │     │                    │    │         │    │
│    │ - Rooms │     │                    │    │ - Users │    │
│    │ - Messages│   │                    │    │ - Conns │    │
│    └─────────┘     │                    │    └─────────┘    │
└───────────────────┘                    └─────────────────────┘
```

## Data Flow Diagrams

### 1. Sending a Text Message

```
User A                 Frontend              Socket.io            Chat Service         MongoDB
  │                       │                      │                      │                  │
  │ Type & Send          │                      │                      │                  │
  ├──────────────────────►│                      │                      │                  │
  │                       │ sendMessage()        │                      │                  │
  │                       ├─────────────────────►│                      │                  │
  │                       │                      │ POST /api/messages   │                  │
  │                       │                      ├─────────────────────►│                  │
  │                       │                      │                      │ Save message     │
  │                       │                      │                      ├─────────────────►│
  │                       │                      │                      │◄─────────────────┤
  │                       │                      │ Emit 'message:send'  │                  │
  │                       │                      │◄─────────────────────┤                  │
  │                       │ Broadcast to room    │                      │                  │
  │                       │◄─────────────────────┤                      │                  │
  │ Message appears      │                      │                      │                  │
  │◄──────────────────────┤                      │                      │                  │
  │                       │                      │                      │                  │
  
User B                 Frontend              Socket.io
  │                       │                      │
  │                       │ 'message:receive'    │
  │                       │◄─────────────────────┤
  │ Message appears      │                      │
  │◄──────────────────────┤                      │
```

### 2. Image Upload Flow

```
User                  Frontend           Upload API         Storage           Chat Service
 │                       │                   │                  │                  │
 │ Select image         │                   │                  │                  │
 ├──────────────────────►│                   │                  │                  │
 │                       │ Preview           │                  │                  │
 │◄──────────────────────┤                   │                  │                  │
 │                       │                   │                  │                  │
 │ Click send           │                   │                  │                  │
 ├──────────────────────►│                   │                  │                  │
 │                       │ POST /upload/image│                  │                  │
 │                       ├──────────────────►│                  │                  │
 │                       │                   │ Save file        │                  │
 │                       │                   ├─────────────────►│                  │
 │                       │                   │◄─────────────────┤                  │
 │                       │ Return URL        │                  │                  │
 │                       │◄──────────────────┤                  │                  │
 │                       │                   │                  │                  │
 │                       │ Send message with URL                │                  │
 │                       ├─────────────────────────────────────────────────────────►│
 │                       │                   │                  │                  │
 │ Image message sent   │                   │                  │                  │
 │◄──────────────────────┤                   │                  │                  │
```

### 3. Real-time Typing Indicator

```
User A               Frontend            Socket.io          User B
 │                      │                    │                 │
 │ Start typing        │                    │                 │
 ├─────────────────────►│ 'typing:start'    │                 │
 │                      ├───────────────────►│                 │
 │                      │                    │ Broadcast       │
 │                      │                    ├────────────────►│
 │                      │                    │                 │ "User A is typing..."
 │                      │                    │                 │
 │ Stop typing (1s)    │                    │                 │
 ├─────────────────────►│ 'typing:stop'     │                 │
 │                      ├───────────────────►│                 │
 │                      │                    │ Broadcast       │
 │                      │                    ├────────────────►│
 │                      │                    │                 │ Indicator cleared
```

### 4. WebRTC Voice Call Setup

```
Caller              Frontend          Socket.io        Receiver          Frontend
  │                    │                  │                │                 │
  │ Click call        │                  │                │                 │
  ├───────────────────►│                  │                │                 │
  │                    │ Create offer     │                │                 │
  │                    ├─────────────────►│                │                 │
  │                    │                  │ 'call:initiate'│                 │
  │                    │                  ├───────────────►│                 │
  │                    │                  │                │ Incoming call   │
  │                    │                  │                ├────────────────►│
  │                    │                  │                │ Click answer    │
  │                    │                  │                │◄────────────────┤
  │                    │                  │ 'call:answer'  │                 │
  │                    │ Answer received  │◄───────────────┤                 │
  │                    │◄─────────────────┤                │                 │
  │                    │                  │                │                 │
  │                    │ Exchange ICE candidates           │                 │
  │                    │◄─────────────────────────────────►│                 │
  │                    │                  │                │                 │
  │ Call connected    │                  │                │  Call connected │
  │◄──────────────────┤                  │                ├────────────────►│
```

## Component Hierarchy

```
ChatPage
  └── SocketProvider
      └── ChatLayout
          ├── Header (global navigation)
          ├── ChatSidebar
          │   ├── Search input
          │   ├── New chat dialog
          │   │   └── User list (community-filtered)
          │   ├── New group dialog
          │   │   ├── Group name input
          │   │   └── Member selection
          │   └── Chat room list
          │       └── ChatRoomItem (each chat)
          │
          ├── ChatArea
          │   ├── Chat header
          │   │   ├── Avatar
          │   │   ├── Name/status
          │   │   └── Actions (call, info)
          │   ├── Messages container
          │   │   ├── MessageItem (text)
          │   │   ├── MessageItem (image)
          │   │   └── MessageItem (voice)
          │   ├── Typing indicator
          │   └── Message input
          │       ├── Text input
          │       ├── Image upload button
          │       ├── Voice recorder button
          │       └── Send button
          │
          └── ChatInfo (conditional)
              ├── Chat/group details
              ├── Members list
              ├── Shared media
              └── Actions
```

## Socket.io Event Flow

```
┌─────────────────────────────────────────────────────┐
│              Socket.io Events                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Client → Server                                    │
│  ┌────────────────────────────────────────────┐    │
│  │ user:register      (userId)                │    │
│  │ chat:join          (chatRoomId)            │    │
│  │ chat:leave         (chatRoomId)            │    │
│  │ message:send       (chatRoomId, message)   │    │
│  │ typing:start       (chatRoomId, userId)    │    │
│  │ typing:stop        (chatRoomId, userId)    │    │
│  │ message:read       (messageId, userId)     │    │
│  │ call:initiate      (targetUserId, offer)   │    │
│  │ call:answer        (targetUserId, answer)  │    │
│  │ call:ice-candidate (targetUserId, ICE)     │    │
│  │ call:end           (targetUserId)          │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  Server → Client                                    │
│  ┌────────────────────────────────────────────┐    │
│  │ user:status        (userId, status)        │    │
│  │ message:receive    (message)               │    │
│  │ typing:update      (userId, isTyping)      │    │
│  │ message:read:update (messageId, userId)    │    │
│  │ call:incoming      (callerId, offer)       │    │
│  │ call:answered      (answer)                │    │
│  │ call:ice-candidate (candidate)             │    │
│  │ call:ended         ()                      │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Database Schemas

### MongoDB (Chat Service)

```
ChatRoom
┌──────────────────────────────────┐
│ _id: ObjectId                    │
│ name: String (optional)          │
│ isGroup: Boolean                 │
│ participants: [Number]           │  ← User IDs from Spring Boot
│ community: String                │
│ createdBy: Number                │
│ lastMessage: ObjectId (ref)      │
│ lastMessageTime: Date            │
│ createdAt: Date                  │
│ updatedAt: Date                  │
└──────────────────────────────────┘

Message
┌──────────────────────────────────┐
│ _id: ObjectId                    │
│ chatRoom: ObjectId (ref)         │
│ sender: Number                   │  ← User ID from Spring Boot
│ senderName: String               │
│ content: String                  │
│ messageType: Enum                │  ← 'text' | 'image' | 'voice'
│ mediaUrl: String (optional)      │
│ readBy: [{                       │
│   userId: Number,                │
│   readAt: Date                   │
│ }]                               │
│ createdAt: Date                  │
│ updatedAt: Date                  │
└──────────────────────────────────┘
```

### MySQL (Spring Boot)

```
users
┌──────────────────────────────────┐
│ id: INT (PK)                     │
│ name: VARCHAR                    │
│ email: VARCHAR                   │
│ profession: VARCHAR              │  ← Community identifier
│ password: VARCHAR                │
│ profile_image_url: VARCHAR       │
│ ...                              │
└──────────────────────────────────┘

connections
┌──────────────────────────────────┐
│ id: INT (PK)                     │
│ requester_id: INT (FK)           │
│ receiver_id: INT (FK)            │
│ status: ENUM                     │
│ created_at: TIMESTAMP            │
└──────────────────────────────────┘
```

## Technology Stack Overview

```
┌───────────────────────────────────────────────────────┐
│                  Frontend Layer                        │
├───────────────────────────────────────────────────────┤
│ React 19          │ UI Library                        │
│ Next.js 15        │ Framework                         │
│ TypeScript        │ Language                          │
│ Tailwind CSS      │ Styling                           │
│ Radix UI          │ Components                        │
│ Socket.io-client  │ Real-time                         │
│ WebRTC            │ Voice calls                       │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│                  Backend Layer                         │
├───────────────────────────────────────────────────────┤
│ Node.js           │ Runtime                           │
│ Express           │ Web framework                     │
│ Socket.io         │ WebSocket server                  │
│ Mongoose          │ MongoDB ODM                       │
│ Multer            │ File uploads                      │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│                   API Layer                            │
├───────────────────────────────────────────────────────┤
│ Spring Boot 3.5   │ REST API framework                │
│ Java 17           │ Language                          │
│ JPA/Hibernate     │ ORM                               │
│ MySQL             │ User database                     │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│                 Storage Layer                          │
├───────────────────────────────────────────────────────┤
│ MongoDB           │ Chat/message data                 │
│ MySQL             │ User/profile data                 │
│ Local FS          │ Media files (dev)                 │
│ Cloudinary/S3     │ Media files (prod)                │
└───────────────────────────────────────────────────────┘
```

This architecture provides:
- ✅ Separation of concerns
- ✅ Scalability (microservices)
- ✅ Real-time capabilities
- ✅ Data persistence
- ✅ Media handling
- ✅ Security through community filtering
