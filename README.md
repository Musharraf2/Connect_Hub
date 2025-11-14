# Connect Hub

A professional community platform for connecting people based on their professions and interests.

## Features

### 🏠 Core Platform
- User authentication and profiles
- Community-based connections
- Professional networking
- Dashboard with personalized feed

### 💬 Community Chat (NEW!)
Real-time messaging system with:
- 1:1 direct messaging
- Group chat creation
- Community-filtered user lists
- Image sharing with preview
- Voice message recording
- WebRTC voice calls
- Typing indicators
- Read receipts
- Online/offline status
- Modern 3-panel UI

[📖 Chat Feature Documentation](./CHAT_FEATURE.md) | [🚀 Quick Start Guide](./CHAT_QUICK_START.md)

## Tech Stack

### Frontend
- **Framework**: Next.js 15 + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Real-time**: Socket.io-client
- **Voice**: WebRTC

### Backend
- **API Server**: Spring Boot 3.5 (Java 17)
- **Chat Service**: Node.js + Express
- **Database**: MySQL (user data) + MongoDB (chat data)
- **Real-time**: Socket.io
- **File Storage**: Cloudinary

## Quick Start

### Prerequisites
- Node.js 16+
- Java 17+
- MySQL
- MongoDB (for chat feature)

### 1. Clone the Repository
```bash
git clone https://github.com/Musharraf2/Connect_Hub.git
cd Connect_Hub
```

### 2. Setup Backend (Spring Boot)
```bash
cd backend/profession-connect
./mvnw spring-boot:run
```

### 3. Setup Chat Service
```bash
cd backend/chat-service
npm install
cp .env.example .env
npm start
```

### 4. Setup Frontend
```bash
cd Frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Chat Service: http://localhost:4000
- Spring Boot API: http://localhost:8080

### 6. Check Setup
```bash
./check-chat-setup.sh
```

## Project Structure

```
Connect_Hub/
├── Frontend/                 # Next.js frontend
│   ├── app/
│   │   ├── dashboard/       # Dashboard pages
│   │   │   └── chat/        # Chat feature
│   │   ├── home/            # Home page
│   │   ├── login/           # Authentication
│   │   └── profile/         # User profiles
│   ├── components/
│   │   ├── chat/            # Chat components
│   │   └── ui/              # Reusable UI components
│   └── lib/
│       ├── api.ts           # API functions
│       ├── chat-api.ts      # Chat API functions
│       └── socket-context.tsx # Socket.io provider
│
├── backend/
│   ├── profession-connect/  # Spring Boot API
│   │   └── src/
│   └── chat-service/        # Node.js chat service
│       ├── models/          # MongoDB models
│       ├── routes/          # API routes
│       └── server.js        # Socket.io server
│
└── docs/                    # Documentation
    ├── CHAT_FEATURE.md
    └── CHAT_QUICK_START.md
```

## Documentation

- [Chat Feature Guide](./CHAT_FEATURE.md) - Complete chat feature documentation
- [Chat Quick Start](./CHAT_QUICK_START.md) - Step-by-step setup guide
- [Image Upload Features](./IMAGE_UPLOAD_FEATURES.md) - Cloudinary integration
- [Quick Start Guide](./QUICK_START.md) - General setup guide
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions

## Features by Module

### Dashboard
- View connections
- Discover community members
- Manage connection requests
- Access chat

### Chat System
- Real-time messaging
- Group conversations
- Media sharing (images, voice)
- Voice calls (WebRTC)
- Presence indicators

### Profile Management
- Update bio and information
- Upload profile images
- View connections
- Academic/professional details

## Development

### Running in Development Mode

**Frontend:**
```bash
cd Frontend
npm run dev
```

**Chat Service:**
```bash
cd backend/chat-service
npm run dev  # With auto-reload
```

**Spring Boot:**
```bash
cd backend/profession-connect
./mvnw spring-boot:run
```

### Building for Production

**Frontend:**
```bash
cd Frontend
npm run build
npm start
```

**Chat Service:**
```bash
cd backend/chat-service
npm start
```

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_CHAT_SERVICE_URL=http://localhost:4000
```

### Chat Service (.env)
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/connect_hub_chat
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Spring Boot (application.properties)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/connect_hub
spring.datasource.username=root
spring.datasource.password=
cloudinary.cloud-name=your-cloud-name
cloudinary.api-key=your-api-key
cloudinary.api-secret=your-api-secret
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Chat service won't start
- Ensure MongoDB is running: `brew services start mongodb-community`
- Check port 4000 is not in use: `lsof -i :4000`

### Frontend build fails
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version` (should be 16+)

### Database connection errors
- Verify MySQL is running
- Check MongoDB is running: `mongosh`
- Update connection strings in config files

For more help, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## License

This project is part of a community platform initiative.

## Authors

- Development Team

## Acknowledgments

- Built with Next.js, React, and Spring Boot
- Real-time messaging powered by Socket.io
- Voice calling with WebRTC
- UI components from Radix UI
