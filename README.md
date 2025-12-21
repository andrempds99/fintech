# FinTech Application

A full-stack FinTech application with React frontend and Node.js/Express backend.

## Quick Start

### Windows

1. **Setup the application:**
   ```cmd
   setup.bat
   ```

2. **Run the application:**
   ```cmd
   run.bat
   ```

### Mac/Linux

1. **Make scripts executable:**
   ```bash
   chmod +x setup.sh run.sh
   ```

2. **Setup the application:**
   ```bash
   ./setup.sh
   ```

3. **Run the application:**
   ```bash
   ./run.sh
   ```

## Manual Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+ (or Docker for PostgreSQL)
- Docker (optional, for running PostgreSQL)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (or copy from `.env.example` if available):
   ```env
   DB_HOST=localhost
   DB_PORT=5433
   DB_NAME=fintech_db
   DB_USER=postgres
   DB_PASSWORD=postgres
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   CORS_ORIGIN=http://localhost:5173
   ```

4. Start PostgreSQL (using Docker):
   ```bash
   docker-compose up -d
   ```

5. Run migrations:
   ```bash
   npm run migrate
   ```

6. Seed database:
   ```bash
   npm run seed
   ```

7. Start development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Application URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api

## Default Credentials

After running the seed script, you'll see demo credentials in the console. Default password for all users is: `password123`

## Project Structure

```
fintech/
├── backend/          # Node.js/Express backend API
├── frontend/         # React frontend application
├── setup.sh          # Setup script (Unix/Mac/Linux)
├── setup.bat         # Setup script (Windows)
├── run.sh            # Run script (Unix/Mac/Linux)
├── run.bat           # Run script (Windows)
└── README.md         # This file
```

## Available Scripts

### Backend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed mock data
- `npm run test` - Run tests

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production

## Features

- User authentication and authorization
- Account management
  - Create, view, and manage accounts
  - Set highlighted account (featured account display)
  - Delete accounts with zero balance
- Transaction history
- Fund transfers (between own accounts and to other users via account number)
- Financial goals tracking
  - Create and manage financial goals
  - Track progress toward goals
  - Goals displayed on both Analytics and Goals pages
- Analytics and insights
  - Spending by category charts
  - Balance trends
  - Income vs expenses
  - Financial goals progress
- Admin dashboard
- Audit logging

## Documentation

- Backend API: See `backend/API.md`
- Implementation Summary: See `IMPLEMENTATION_SUMMARY.md`

## License

ISC

#
