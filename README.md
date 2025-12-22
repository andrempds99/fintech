# FinTech Application

A full-stack FinTech application with React frontend and Node.js/Express backend.

## 🌐 Access the Live Application (EC2)

**Application URL:** http://15.237.181.208

### Get Login Credentials



To get all login credentials and account details, run this script:

**Windows (PowerShell):**
```powershell
cd C:\Users\andre\Desktop\fintech
.\check-ec2-seed-accounts.ps1
```

**If you get execution policy errors:**
```powershell
powershell -ExecutionPolicy Bypass -File .\check-ec2-seed-accounts.ps1
```

**What you'll get:**
- ✅ All user emails and passwords
- ✅ Account numbers (for transfers)
- ✅ Account balances and types
- ✅ Account status (active/closed)

**Default password:** `password123` (for all seed users)

**Quick Login:**
1. Open http://15.237.181.208 in your browser
2. Run the script above to get an email address
3. Login with: `email` / `password123`

### Current Seed Accounts

**Users & Credentials:**
- **Admin:** emma.williams@test.com (Emma Williams) - `password123`
- **Users:**
  - david.taylor@test.com (David Taylor) - `password123`
  - james.taylor@test.com (James Taylor) - `password123`
  - sophia.johnson@demo.com (Sophia Johnson) - `password123`
  - sophia.williams@example.com (Sophia Williams) - `password123`

**Account Details:**

**Admin (emma.williams@test.com):**
- Investment Portfolio (Investment) - `****8170` - $44,066.36 - closed
- Premium Checking (Checking) - `****3654` - $11,168.33 - active ✓
- Savings Plus (Savings) - `****9798` - $2,789.42 - active ✓

**david.taylor@test.com:**
- Investment Portfolio (Investment) - `****8966` - $10,874.00 - active ✓
- Premium Checking (Checking) - `****9114` - $32,081.43 - closed
- Savings Plus (Savings) - `****3753` - $8,321.31 - active ✓

**james.taylor@test.com:**
- Investment Portfolio (Investment) - `****5104` - $273.59 - active ✓
- Premium Checking (Checking) - `****8048` - $3,098.08 - active ✓
- Savings Plus (Savings) - `****1140` - $3,572.92 - closed

**sophia.johnson@demo.com:**
- Investment Portfolio (Investment) - `****7254` - $11,609.83 - active ✓
- Premium Checking (Checking) - `****2852` - $53,672.05 - closed
- Savings Plus (Savings) - `****9801` - $30,044.70 - closed

**sophia.williams@example.com:**
- Investment Portfolio (Investment) - `****4647` - $8,655.38 - active ✓
- Premium Checking (Checking) - `****9245` - $17,716.35 - active ✓
- Savings Plus (Savings) - `****5464` - $96,896.16 - closed

> **Note:** Active accounts (marked with ✓) can receive transfers. Use the last 4 digits of account numbers (e.g., `3654`, `8966`) for transfers.

---

## 📋 Local Development Setup

### Quick Start

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

**EC2 Deployment:**
- **Frontend:** http://15.237.181.208
- **Backend API:** http://15.237.181.208/api

**Local Development:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api

## 🔑 Getting Login Credentials

### For EC2 Deployment (Recommended)

Use the automated script to get all login credentials and account details:

```powershell
# Run from project root directory
.\check-ec2-seed-accounts.ps1
```

**The script displays:**
- All user emails and names
- User roles (admin/user)
- Complete account information:
  - Account numbers (e.g., `****8966`, `****3654`)
  - Account types (Checking, Savings, Investment)
  - Current balances
  - Account status (active/closed)

**Default password:** `password123` (for all seed users)

**Troubleshooting the script:**
- If you get execution policy errors, use: `powershell -ExecutionPolicy Bypass -File .\check-ec2-seed-accounts.ps1`
- Make sure your EC2 instance is running
- Verify SSH key is at the correct path (update `$KEY_PATH` in script if needed)

### For Local Development

When you run the seed script locally, credentials are displayed in the console:

```bash
cd backend
npm run seed
```

The output shows all user emails, passwords, and account details.


## Project Structure

```
fintech/
├── backend/                          # Node.js/Express backend API
│   ├── src/
│   │   ├── auth/                    # Authentication (JWT, password hashing)
│   │   ├── controllers/             # Request handlers
│   │   ├── database/                # DB connection, migrations, seeds
│   │   ├── middleware/              # Auth, validation, error handling
│   │   ├── repositories/            # Data access layer
│   │   ├── routes/                  # API route definitions
│   │   ├── services/                # Business logic
│   │   ├── types/                   # TypeScript type definitions
│   │   └── utils/                   # Utility functions (logger)
│   ├── API.md                       # Complete API documentation
│   ├── README.md                    # Backend-specific documentation
│   ├── docker-compose.yml           # Local PostgreSQL setup
│   ├── docker-compose.prod.yml      # Production Docker setup
│   └── Dockerfile                   # Backend container image
├── frontend/                         # React frontend application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   └── ui/                  # shadcn/ui component library
│   │   ├── contexts/                # React contexts (auth, theme)
│   │   ├── pages/                   # Page components
│   │   ├── services/                # API service layer
│   │   ├── lib/                     # Utilities and API client
│   │   └── styles/                  # Global styles
│   ├── Dockerfile                   # Frontend container image
│   └── nginx.conf                   # Nginx configuration
├── check-ec2-seed-accounts.ps1      # Windows script to get EC2 credentials
├── check-ec2-seed-accounts.sh       # Mac/Linux script to get EC2 credentials
└── README.md                        # This file
```

## Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript for production
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed mock data
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production (creates optimized bundle)

### Helper Scripts
- `check-ec2-seed-accounts.ps1` - Get EC2 login credentials (Windows)
- `check-ec2-seed-accounts.sh` - Get EC2 login credentials (Mac/Linux)

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
- **Scheduled Transfers** - Set up recurring transfers (daily, weekly, monthly)
- **Transfer Scheduling** - Schedule future transfers with automatic execution

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
- **Transfers** - Fund transfer interface (including scheduled transfers)
- **Goals** - Financial goals management
- **Alerts** - Alert configuration and management
- **Analytics** - Financial insights and charts
- **Admin** - Administrative dashboard (admin only)
- **Login** - User authentication
- **Forgot Password** - Password recovery flow
- **Design System** - UI component showcase and design tokens

### 📄 Data Export
- **Transaction Export** - Export transaction history (PDF format)
- **Account Statements** - Generate account statements
- **Data Download** - Download financial data for record keeping

### 🔧 Technical Features
- **RESTful API** - Well-structured API endpoints
- **Database Migrations** - Version-controlled database schema
- **Mock Data Seeding** - Automated test data generation
- **Type Safety** - Full TypeScript implementation
- **Error Handling** - Comprehensive error management
- **Input Validation** - Server-side and client-side validation
- **Security Headers** - Helmet.js for security best practices
- **CORS Protection** - Configured cross-origin resource sharing
- **Docker Support** - Containerized deployment for production
- **Logging** - Winston logger for application monitoring
- **PDF Generation** - PDFKit for document generation

## Technology Stack

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator
- **Logging:** Winston
- **PDF Generation:** PDFKit
- **Security:** Helmet.js, CORS

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Forms:** React Hook Form
- **HTTP Client:** Axios
- **Notifications:** Sonner
- **Theme:** next-themes (dark/light mode)

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx (production)
- **Database:** PostgreSQL 15
- **Deployment:** AWS EC2

## Documentation

- **Backend API:** See `backend/API.md` for complete API endpoint documentation
- **Backend Setup:** See `backend/README.md` for backend-specific setup
- **Frontend Guidelines:** See `frontend/src/guidelines/Guidelines.md`

## License

ISC

#
