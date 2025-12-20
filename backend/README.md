# FinTech Backend API

Backend API server for the FinTech application built with Node.js, Express, TypeScript, and PostgreSQL.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+ (or use Docker Compose)
- TypeScript knowledge

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### 3. Setup Database

**Option A: Using Docker Compose (Recommended)**

```bash
docker-compose up -d
```

**Option B: Local PostgreSQL**

Create a database named `fintech_db`:

```sql
CREATE DATABASE fintech_db;
```

### 4. Run Migrations

```bash
npm run migrate
```

### 5. Seed Mock Data

```bash
npm run seed
```

### 6. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed mock data
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
backend/
├── src/
│   ├── auth/           # Authentication logic
│   ├── controllers/    # Request handlers
│   ├── database/       # Database connection, migrations, seeds
│   ├── middleware/     # Express middleware
│   ├── mock/           # Mock data generation
│   ├── repositories/   # Data access layer
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   ├── app.ts          # Express app setup
│   └── index.ts        # Entry point
├── .env.example        # Environment variables template
├── docker-compose.yml   # Docker setup for PostgreSQL
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile

### Accounts
- `GET /api/accounts` - List user accounts
- `GET /api/accounts/:id` - Get account details

### Transactions
- `GET /api/transactions` - List transactions (with filters)
- `POST /api/transactions` - Create transaction

### Transfers
- `POST /api/transfers` - Create transfer between accounts

### Analytics
- `GET /api/analytics/spending` - Spending analytics
- `GET /api/analytics/balance-trend` - Balance trend data

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/accounts` - List all accounts
- `GET /api/admin/audit-logs` - View audit logs
- `POST /api/admin/reset-data` - Reset mock data

## Environment Variables

See `.env.example` for all available environment variables.

## Database Migrations

Migrations are stored in `src/database/migrations/` and are applied sequentially. The migration system tracks applied migrations in the `migrations` table.

## Mock Data

The application uses seeded mock data for development. Run `npm run seed` to populate the database with test data.

## Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Helmet security headers
- Input validation with express-validator
- Role-based access control

## Testing

```bash
npm run test
```

## License

ISC

