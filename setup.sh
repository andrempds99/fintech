#!/bin/bash

# FinTech Application Setup Script
# This script sets up and runs the FinTech application

set -e  # Exit on error

echo "🚀 FinTech Application Setup"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check if Docker is installed (for PostgreSQL)
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker is not installed. You'll need to set up PostgreSQL manually.${NC}"
    USE_DOCKER=false
else
    USE_DOCKER=true
fi

echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "Backend dependencies already installed"
fi

# Setup backend .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${BLUE}📝 Creating backend .env file...${NC}"
    cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=fintech_db
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# CORS
CORS_ORIGIN=http://localhost:5173
EOF
    echo -e "${GREEN}✅ Backend .env file created${NC}"
else
    echo "Backend .env file already exists"
fi

# Start PostgreSQL with Docker if available
if [ "$USE_DOCKER" = true ]; then
    echo -e "${BLUE}🐳 Starting PostgreSQL with Docker...${NC}"
    docker-compose up -d
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
fi

# Run migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
npm run migrate

# Seed database
echo -e "${BLUE}🌱 Seeding database...${NC}"
npm run seed

cd ..

echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "Frontend dependencies already installed"
fi

# Setup frontend .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${BLUE}📝 Creating frontend .env file...${NC}"
    cat > .env << EOF
VITE_API_URL=http://localhost:3001/api
EOF
    echo -e "${GREEN}✅ Frontend .env file created${NC}"
else
    echo "Frontend .env file already exists"
fi

cd ..

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}To run the application:${NC}"
echo "  1. Backend:  cd backend && npm run dev"
echo "  2. Frontend: cd frontend && npm run dev"
echo ""
echo -e "${BLUE}Or use the run script: ./run.sh${NC}"

