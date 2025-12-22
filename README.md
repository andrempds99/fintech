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

### How to Check Seed Account Usernames and Accounts

The seed script creates random user emails, so you need to check them after seeding. Here are several ways:

> **💡 Quick Tip:** For EC2 deployments, use the helper script `check-ec2-seed-accounts.ps1` (see EC2 section below)

#### Method 1: Check Seed Script Output (Easiest)

When you run `npm run seed` in the backend directory, the script automatically displays all credentials and accounts:

```bash
cd backend
npm run seed
```

The output will show:
- Admin user email and password
- Regular user emails and password  
- All accounts for each user with account numbers and balances

#### Method 2: Query Database Directly

```bash
# Connect to PostgreSQL
psql -U postgres -d fintech_db

# View all users
SELECT email, name, role FROM users ORDER BY role, email;

# View all accounts with user information
SELECT 
  u.email, 
  u.name as user_name, 
  a.name as account_name, 
  a.type, 
  a.account_number, 
  a.balance, 
  a.status
FROM accounts a
JOIN users u ON a.user_id = u.id
ORDER BY u.email, a.name;
```

#### Method 3: Use Admin API (After Login)

1. Login as any user to get a token
2. If you're an admin, use the admin endpoints:

```bash
# Get all users
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/admin/users

# Get all accounts
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/admin/accounts
```

**Important Notes:**
- All seed users have password: `password123`
- The seed script creates 1 admin user and 4 regular users
- Each user gets 3-4 accounts with random account numbers
- Emails are randomly generated, so check the seed output or database to get actual emails

### For EC2 Deployments: Quick Check Script

If your application is deployed on EC2, you can use the automated helper script to check all seed accounts:

**Windows (PowerShell):**
```powershell
# Navigate to project directory
cd C:\Users\andre\Desktop\fintech

# Run the check script
.\check-ec2-seed-accounts.ps1
```

**If you get execution policy errors:**
```powershell
powershell -ExecutionPolicy Bypass -File .\check-ec2-seed-accounts.ps1
```

The script will automatically:
- ✅ Connect to your EC2 instance
- ✅ Check database status
- ✅ Display all users with emails and roles
- ✅ Show detailed account information (account numbers, balances, types, status)
- ✅ Provide login instructions

**What You'll See:**
- **Users & Credentials:** All user emails, names, and roles (admin/user)
- **Detailed Account Information:** Complete account details including:
  - Account numbers (e.g., `****8966`, `****3654`)
  - Account names and types (Checking, Savings, Investment)
  - Current balances
  - Account status (active/closed)
- **Quick Reference:** Summary with login instructions

**Prerequisites:**
- EC2 instance must be running
- SSH key file at: `C:\Users\andre\Downloads\fintech-key.pem`
- Database must be migrated and seeded (see `DEPLOYMENT_QUICK_START.md`)

For more details, see `DEPLOYMENT_QUICK_START.md` section "Seed Accounts Information".

## Project Structure

```
fintech/
├── backend/                    # Node.js/Express backend API
├── frontend/                   # React frontend application
├── setup.sh                   # Setup script (Unix/Mac/Linux)
├── setup.bat                  # Setup script (Windows)
├── run.sh                     # Run script (Unix/Mac/Linux)
├── run.bat                    # Run script (Windows)
├── check-ec2-seed-accounts.ps1 # Helper script to check EC2 seed accounts
├── DEPLOYMENT_QUICK_START.md  # EC2 deployment guide
└── README.md                  # This file
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

## Application Features

> **Quick Overview:** This FinTech application provides comprehensive personal finance management with account management, transactions, transfers, goals tracking, analytics, and admin capabilities. Built with modern technologies for security, performance, and user experience.

### 🔐 Authentication & Security
- **User Registration & Login** - Secure email/password authentication
- **Password Reset** - Forgot password functionality with reset flow
- **JWT Token Management** - Secure session handling with refresh tokens
- **Role-Based Access Control** - Admin and user roles with different permissions
- **Password Hashing** - Bcrypt encryption for secure password storage
- **Audit Logging** - Comprehensive activity tracking for security and compliance

### 💳 Account Management
- **Multi-Account Support** - Create and manage multiple accounts per user
- **Account Types** - Support for Checking, Savings, Investment, Business, and Credit accounts
- **Account Highlighting** - Feature specific accounts for quick access
- **Account Status Management** - Active, suspended, and closed account states
- **Account Deletion** - Remove accounts with zero balance
- **Account Details** - View account numbers, balances, limits, and transaction history
- **Balance Tracking** - Real-time balance updates with currency support

### 💸 Transactions
- **Transaction History** - Complete transaction log with detailed information
- **Transaction Filtering** - Filter by date range, category, merchant, and status
- **Transaction Categories** - Groceries, dining, transportation, utilities, entertainment, shopping, healthcare, etc.
- **Transaction Status** - Track pending, completed, and failed transactions
- **Transaction Search** - Quick search by merchant, category, or amount
- **Pagination** - Efficient handling of large transaction lists

### 🔄 Fund Transfers
- **Internal Transfers** - Transfer funds between your own accounts
- **External Transfers** - Send money to other users via account number
- **Transfer Validation** - Balance checks and account status validation
- **Transfer History** - Complete record of all transfers
- **Real-time Balance Updates** - Automatic balance adjustment after transfers

### 🎯 Financial Goals
- **Goal Creation** - Set financial goals with target amounts and dates
- **Goal Categories** - Emergency fund, vacation, down payment, debt payoff, education, retirement
- **Progress Tracking** - Monitor progress toward goals with visual indicators
- **Goal Management** - Update, pause, complete, or cancel goals
- **Progress Updates** - Add progress contributions to goals
- **Goal Analytics** - View goals progress on Analytics dashboard

### 📊 Analytics & Insights
- **Spending Analytics** - Visual breakdown of spending by category
- **Balance Trends** - Track account balance changes over time
- **Income vs Expenses** - Compare income and spending patterns
- **Financial Goals Progress** - Visual representation of goals completion
- **Interactive Charts** - Powered by Recharts for data visualization
- **Time-based Analysis** - View trends over different time periods

### 🔔 Alerts & Notifications
- **Low Balance Alerts** - Set thresholds for account balance warnings
- **Large Transaction Alerts** - Monitor transactions above specified amounts
- **Alert Management** - Create, update, and deactivate alerts
- **Alert Status** - Active/inactive alert states

### 👥 Admin Dashboard
- **User Management** - View all users, their roles, and account information
- **Account Overview** - Monitor all accounts across the platform
- **Audit Logs** - Review system activity and user actions
- **Data Reset** - Reset mock data for testing purposes
- **System Monitoring** - Track platform usage and activity

### 🎨 User Experience
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme** - Toggle between themes for comfortable viewing
- **Modern UI** - Clean, professional interface with comprehensive design system
- **Real-time Updates** - Live balance and transaction updates
- **Loading States** - Skeleton loaders and progress indicators
- **Error Handling** - User-friendly error messages and validation feedback
- **Accessibility** - WCAG-compliant design with keyboard navigation support

### 📱 Pages & Navigation
- **Dashboard** - Main overview with KPIs and quick actions
- **Accounts** - Account management and details
- **Transactions** - Transaction history and filtering
- **Transfers** - Fund transfer interface
- **Goals** - Financial goals management
- **Alerts** - Alert configuration and management
- **Analytics** - Financial insights and charts
- **Admin** - Administrative dashboard (admin only)
- **Login** - User authentication
- **Forgot Password** - Password recovery flow

### 🔧 Technical Features
- **RESTful API** - Well-structured API endpoints
- **Database Migrations** - Version-controlled database schema
- **Mock Data Seeding** - Automated test data generation
- **Type Safety** - Full TypeScript implementation
- **Error Handling** - Comprehensive error management
- **Input Validation** - Server-side and client-side validation
- **Security Headers** - Helmet.js for security best practices
- **CORS Protection** - Configured cross-origin resource sharing

## Documentation

- Backend API: See `backend/API.md`
- Implementation Summary: See `IMPLEMENTATION_SUMMARY.md`

## License

ISC

#
