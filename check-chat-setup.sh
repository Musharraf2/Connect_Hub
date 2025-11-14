#!/bin/bash

# Chat Service Health Check Script
# This script verifies that all required services are running

echo "🔍 Checking Community Chat Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check MongoDB
echo -n "MongoDB (port 27017): "
if nc -z localhost 27017 2>/dev/null; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo -e "${YELLOW}  → Start with: brew services start mongodb-community${NC}"
fi

# Check Chat Service
echo -n "Chat Service (port 4000): "
if curl -s http://localhost:4000/health >/dev/null 2>&1; then
    response=$(curl -s http://localhost:4000/health)
    echo -e "${GREEN}✓ Running${NC}"
    echo "  Response: $response"
else
    echo -e "${RED}✗ Not running${NC}"
    echo -e "${YELLOW}  → Start with: cd backend/chat-service && npm start${NC}"
fi

# Check Frontend
echo -n "Frontend (port 3000): "
if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo -e "${YELLOW}  → Start with: cd Frontend && npm run dev${NC}"
fi

# Check Spring Boot
echo -n "Spring Boot API (port 8080): "
if nc -z localhost 8080 2>/dev/null; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo -e "${YELLOW}  → Start with: cd backend/profession-connect && ./mvnw spring-boot:run${NC}"
fi

echo ""
echo "📝 Configuration Files:"

# Check backend .env
if [ -f "backend/chat-service/.env" ]; then
    echo -e "${GREEN}✓${NC} backend/chat-service/.env exists"
else
    echo -e "${RED}✗${NC} backend/chat-service/.env missing"
    echo -e "${YELLOW}  → Copy from: backend/chat-service/.env.example${NC}"
fi

# Check frontend .env.local
if [ -f "Frontend/.env.local" ]; then
    echo -e "${GREEN}✓${NC} Frontend/.env.local exists"
else
    echo -e "${RED}✗${NC} Frontend/.env.local missing"
    echo -e "${YELLOW}  → Copy from: Frontend/.env.local.example${NC}"
fi

echo ""
echo "📚 Quick Links:"
echo "  • Chat Feature: http://localhost:3000/dashboard/chat"
echo "  • API Health: http://localhost:4000/health"
echo "  • Documentation: CHAT_QUICK_START.md"

echo ""
echo "Done! 🎉"
