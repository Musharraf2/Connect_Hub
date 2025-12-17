# 🌐 ConnectHub - Professional Community Platform

> A domain-specific professional networking platform that connects verified professionals within their respective fields, fostering meaningful relationships and career opportunities. 

[![TypeScript](https://img.shields.io/badge/TypeScript-75%25-blue)](https://www.typescriptlang.org/)
[![Java](https://img.shields.io/badge/Java-23. 3%25-red)](https://www.java.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.2. 4-black)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green)](https://spring.io/projects/spring-boot)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Contributing](#contributing)

## 🎯 Overview

**ConnectHub** is a Final Year Project that revolutionizes professional networking by creating domain-specific communities where professionals can connect, share knowledge, collaborate on opportunities, and build authentic relationships within their field. Unlike generic social platforms, ConnectHub ensures meaningful connections by grouping users into profession-based communities.

### Key Highlights

- 🎓 **Multi-Domain Support**: Students, Doctors, Engineers, Teachers, Dancers, and 30+ professions
- 🔐 **Email Verification**: SMS-based OTP authentication via Twilio
- 🤖 **AI-Powered Moderation**: OpenAI integration for content safety and fact-checking
- 💬 **Real-time Messaging**: WebSocket-based instant messaging with read receipts
- 💼 **Job Board**: Profession-specific job postings with safety verification
- 🔒 **Trust & Safety**: AI-driven content moderation with auto-delete capabilities

## ✨ Features

### Core Features

#### 1. **Professional Networking**
- Create verified professional profiles with bio and profile pictures
- Connect with professionals in your specific domain
- View global community members by profession
- Profile customization with image cropping

#### 2. **Real-time Messaging**
- WebSocket-powered instant messaging using STOMP over SockJS
- Online/offline status indicators
- Message read receipts (single/double check marks)
- Image sharing in conversations
- Emoji picker integration
- Message deletion capabilities
- Conversation management

#### 3. **Social Feed**
- Create and share posts with text and images
- Like and comment on posts
- AI-powered content moderation with safety notes
- Report inappropriate content
- Image cropping for post uploads
- Community-specific content filtering

#### 4. **Job Board**
- Create and browse job postings within your profession
- Filter by job type (Full-time, Part-time, Contract, Internship)
- Filter by location (Remote, Hybrid, On-site)
- AI-powered link safety verification
- Direct application with external links
- User-posted job management

#### 5. **AI Content Moderation**
- Automatic content analysis for: 
  - Sexually explicit content
  - Hate speech detection
  - Misinformation flagging
- Auto-delete harmful content
- Community notes for borderline content
- Image content analysis

#### 6. **Authentication & Security**
- Email/password authentication
- SMS OTP verification via Twilio
- Session management
- Secure password handling

### User Experience

- 🎨 **Dark/Light Theme**: System-aware theme with manual toggle
- 📱 **Responsive Design**: Mobile-first approach with dedicated mobile navigation
- ⚡ **Modern UI**: Built with Radix UI and Tailwind CSS
- 🎭 **Smooth Animations**: Framer Motion integration
- 🔔 **Toast Notifications**: Real-time feedback with react-hot-toast

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15.2.4 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **WebSocket**: STOMP. js with SockJS
- **Image Handling**: react-image-crop

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java
- **Database**: JPA/Hibernate (configured)
- **WebSocket**: Spring WebSocket with STOMP
- **AI Integration**: OpenAI API
- **SMS Service**: Twilio API
- **Security**: Spring Security

### DevOps & Tools
- **Version Control**: Git/GitHub
- **Package Manager**: npm (Frontend), Maven (Backend)
- **Development**:  Turbopack (Next.js)

## 🏗 Architecture

```
Connect_Hub/
├── Frontend/                 # Next.js application
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx         # Landing page
│   │   ├── login/           # Authentication
│   │   ├── signup/          # Registration
│   │   ├── home/            # Main feed
│   │   ├── messages/        # Real-time chat
│   │   ├── jobs/            # Job board
│   │   └── profile/         # User profiles
│   ├── components/          # Reusable UI components
│   ├── lib/                 # API clients and utilities
│   └── public/              # Static assets
│
├── backend/                 # Spring Boot application
│   └── profession-connect/
│       └── src/main/java/com/community/profession_connect/
│           ├── controller/  # REST controllers
│           ├── service/     # Business logic
│           │   └── AiNoteService.java  # AI moderation
│           ├── model/       # Entity classes
│           ├── repository/  # Data access layer
│           └── config/      # Configuration classes
│
├── .env. example            # Environment variables template
├── TWILIO_SETUP.md        # Twilio configuration guide
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **Java** 17 or higher
- **Maven** 3.8+
- **PostgreSQL** or **MySQL** (or your preferred database)
- **Twilio Account** (for SMS OTP)
- **OpenAI API Key** (for content moderation)

### Frontend Setup

1. **Navigate to the Frontend directory:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env. local
   ```

4. **Configure the API endpoint** in `lib/api. ts`:
   ```typescript
   const API_BASE_URL = 'http://localhost:8080';
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend/profession-connect
   ```

2. **Configure application properties** (`src/main/resources/application.properties`):
   ```properties
   # Database Configuration
   spring.datasource.url=jdbc:postgresql://localhost:5432/connecthub
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   
   # JPA Configuration
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa. show-sql=true
   
   # Server Configuration
   server.port=8080
   ```

3. **Build the project:**
   ```bash
   mvn clean install
   ```

4. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

The backend server will start at [http://localhost:8080](http://localhost:8080)

## ⚙️ Configuration

### Twilio SMS Setup

ConnectHub uses Twilio for SMS-based OTP verification. Follow these steps:

1. **Sign up for Twilio** at [https://www.twilio.com](https://www.twilio.com)

2. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Configure Twilio credentials** in `.env`:
   ```env
   TWILIO_ENABLED=true
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+15551234567
   ```

4. **For development without SMS**, set: 
   ```env
   TWILIO_ENABLED=false
   ```
   OTP codes will be printed to the console. 

📖 **Detailed Setup**:  See [TWILIO_SETUP.md](./TWILIO_SETUP.md)

### OpenAI API Setup

For AI-powered content moderation: 

1. **Get your API key** from [OpenAI Platform](https://platform.openai.com/api-keys)

2. **⚠️ SECURITY WARNING**: Never commit API keys to version control!

3. **Configure in backend** `application.properties`:
   ```properties
   openai.api.key=${OPENAI_API_KEY}
   ```

4. **Set environment variable:**
   ```bash
   export OPENAI_API_KEY=your_api_key_here
   ```

## 📡 API Documentation

### Authentication Endpoints

```
POST /api/auth/signup          # User registration
POST /api/auth/login           # User login
POST /api/auth/verify-email    # Email verification with OTP
```

### User Endpoints

```
GET  /api/users/{id}           # Get user profile
PUT  /api/users/{id}           # Update user profile
GET  /api/users/search         # Search users by profession
```

### Post Endpoints

```
GET    /api/posts              # Get all posts
POST   /api/posts              # Create new post
PUT    /api/posts/{id}         # Update post
DELETE /api/posts/{id}         # Delete post
POST   /api/posts/{id}/like    # Like/unlike post
POST   /api/posts/{id}/comment # Add comment
```

### Job Endpoints

```
GET    /api/jobs               # Get all job posts
POST   /api/jobs               # Create job post
DELETE /api/jobs/{id}          # Delete job post
GET    /api/jobs/filter        # Filter jobs by type/location
```

### Messaging Endpoints (WebSocket)

```
WS /ws                         # WebSocket connection
/queue/messages/{userId}       # Receive messages
/app/send                      # Send message
/app/mark-read                 # Mark messages as read
```

## 🔒 Security Features

### Content Moderation
- AI-powered analysis of all posts
- Automatic detection of harmful content
- Categories:  Sexually explicit, Hate speech, Misinformation
- Auto-delete capability for severe violations
- Community notes for educational purposes

### Job Safety
- AI verification of application links
- Safety warnings for suspicious links
- User acknowledgment required for unsafe links

### Authentication
- SMS-based OTP verification
- Secure session management
- Password encryption

### Best Practices
- Environment variables for sensitive data
- API key rotation recommended
- Rate limiting (implement as needed)
- CORS configuration for frontend

## 🤝 Contributing

This is a Final Year Project.  If you'd like to contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is part of an academic Final Year Project. 

## 👥 Available Communities

ConnectHub supports 30+ professional communities including:

- 🎓 Students
- 👨‍⚕️ Doctors
- 👨‍🏫 Teachers
- 👨‍💻 Engineers
- ⚖️ Lawyers
- 🏗️ Architects
- 👨‍🍳 Chefs
- 👮 Police Officers
- 🚒 Firefighters
- ✈️ Pilots
- 👩‍⚕️ Nurses
- 🌾 Farmers
- 💃 Dancers
- 🎤 Singers
- And many more! 

## 🐛 Known Issues & Future Improvements

- [ ] Implement rate limiting for API endpoints
- [ ] Add end-to-end testing
- [ ] Enhance mobile responsiveness
- [ ] Add video call functionality
- [ ] Implement notification system
- [ ] Add analytics dashboard

## 📞 Support

For issues, questions, or contributions, please open an issue on the GitHub repository. 

---

**⚠️ Important Security Note**: This README previously contained exposed API keys in the repository. All API keys have been identified and should be rotated immediately. Always use environment variables and never commit sensitive credentials to version control.

Built with ❤️ as a Final Year Project
