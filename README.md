# FinTech Dashboard

A modern, full-stack financial technology dashboard application built with React and Node.js, deployed on AWS CloudFront.

## 🌐 Live URL

**Production**: [https://d8hyh9dyaxuno.cloudfront.net](https://d8hyh9dyaxuno.cloudfront.net)

## 📝 Description

FinTech Dashboard is a comprehensive personal finance management application that allows users to track their bank accounts, view transactions, analyze spending patterns, and manage their financial portfolio. The application features a beautiful, modern UI with real-time data visualization and secure authentication.

## ✨ Features

### Authentication & Security
- 🔐 Secure JWT-based authentication
- 🔄 Token refresh mechanism
- 🔒 Password reset functionality
- 👤 Role-based access control (Admin/User)

### Account Management
- 💳 Multiple account types (Checking, Savings, Investment, Business)
- 📊 Real-time balance tracking
- 🏦 Account status management (Active/Closed)
- 💰 Multi-currency support

### Transaction Tracking
- 📜 Complete transaction history
- 🏷️ Category-based organization
- 🔍 Advanced filtering and search
- 📅 Date range filtering

### Analytics & Insights
- 📈 Spending analytics dashboard
- 📊 Category breakdown charts
- 💹 Income vs. expenses visualization
- 📉 Monthly trend analysis

### User Experience
- 🎨 Modern, responsive UI design
- 🌙 Clean and intuitive interface
- 🔔 Real-time notifications
- 📱 Mobile-friendly design

## 🔑 Demo Credentials

| Email | Name | Role | Password |
|-------|------|------|----------|
| `admin@fintech.demo` | Admin User | admin | `password123` |
| `john.doe@fintech.demo` | John Doe | user | `password123` |
| `jane.smith@fintech.demo` | Jane Smith | user | `password123` |
| `demo@fintech.demo` | Demo User | user | `password123` |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AWS CloudFront (CDN)                     │
│                    HTTPS Distribution                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      EC2 Instance                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                      Nginx                            │   │
│  │  ┌─────────────────┐    ┌─────────────────────────┐ │   │
│  │  │  Static Files   │    │    Reverse Proxy        │ │   │
│  │  │  /var/www/html  │    │    /api → Backend       │ │   │
│  │  └─────────────────┘    └─────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Docker Containers                        │   │
│  │  ┌─────────────────┐    ┌─────────────────────────┐ │   │
│  │  │    Backend      │    │     PostgreSQL          │ │   │
│  │  │   (Node.js)     │◄──►│     Database            │ │   │
│  │  │   Port 3001     │    │     Port 5432           │ │   │
│  │  └─────────────────┘    └─────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **TypeORM** - ORM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **express-validator** - Input validation

### Infrastructure
- **AWS CloudFront** - CDN & HTTPS
- **AWS EC2** - Compute
- **Docker** - Containerization
- **Nginx** - Web server/Reverse proxy
- **Terraform** - Infrastructure as Code

## 📁 Project Structure

```
fintech/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilities
│   └── package.json
│
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── database/        # DB config & migrations
│   │   └── auth/            # Authentication logic
│   └── package.json
│
└── infrastructure/          # Terraform IaC
    └── terraform/
        ├── main.tf          # CloudFront configuration
        └── variables.tf     # Variables
```

## 🚀 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/demo-accounts` | Get demo account list |

### Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accounts` | Get user accounts |
| POST | `/api/accounts` | Create new account |
| GET | `/api/accounts/:id` | Get account by ID |
| PUT | `/api/accounts/:id` | Update account |
| DELETE | `/api/accounts/:id` | Delete account |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get transactions (with filters) |
| POST | `/api/transactions` | Create transaction |
| GET | `/api/transactions/:id` | Get transaction by ID |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary` | Get financial summary |
| GET | `/api/analytics/categories` | Get spending by category |
| GET | `/api/analytics/trends` | Get spending trends |

## 🔧 Local Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Setup

```bash
# Clone the repository
git clone https://github.com/andrempds99/fintech.git
cd fintech

# Backend setup
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/fintech
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

## 📄 License

MIT License - feel free to use this project for learning and development.

---

**Built with ❤️ using React, Node.js, and AWS**
