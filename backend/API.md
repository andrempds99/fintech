# FinTech API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "user" // optional, defaults to "user"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

#### POST /api/auth/refresh
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### Users

#### GET /api/users/me
Get current user profile.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "avatar": "JD"
}
```

#### PUT /api/users/me
Update current user profile.

**Request Body:**
```json
{
  "name": "John Updated",
  "avatar": "JU" // optional
}
```

### Accounts

#### GET /api/accounts
Get all accounts for current user.

**Response:**
```json
{
  "accounts": [
    {
      "id": "uuid",
      "name": "Premium Checking",
      "type": "Checking",
      "balance": 24580.50,
      "currency": "USD",
      "status": "active",
      "account_number": "****4521",
      "limit": 50000
    }
  ]
}
```

#### GET /api/accounts/:id
Get account details.

#### POST /api/accounts
Create a new account.

**Request Body:**
```json
{
  "name": "Savings Account",
  "type": "Savings",
  "currency": "USD", // optional
  "limit": 10000 // optional
}
```

### Transactions

#### GET /api/transactions
Get transactions with optional filters.

**Query Parameters:**
- `account_id` (optional): Filter by account
- `category` (optional): Filter by category
- `status` (optional): Filter by status (pending, completed, failed)
- `start_date` (optional): Start date (ISO format)
- `end_date` (optional): End date (ISO format)
- `search` (optional): Search in merchant name
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "transactions": [...],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

#### POST /api/transactions
Create a new transaction.

**Request Body:**
```json
{
  "account_id": "uuid",
  "date": "2024-12-20",
  "merchant": "Amazon.com",
  "category": "shopping",
  "amount": -89.47,
  "status": "completed" // optional
}
```

### Transfers

#### POST /api/transfers
Create a transfer between accounts.

**Request Body:**
```json
{
  "fromAccountId": "uuid",
  "toAccountId": "uuid",
  "amount": 500.00,
  "description": "Monthly savings" // optional
}
```

**Response:**
```json
{
  "fromTransaction": {...},
  "toTransaction": {...},
  "fromAccount": {...},
  "toAccount": {...}
}
```

### Analytics

#### GET /api/analytics/spending
Get spending by category.

**Query Parameters:**
- `start_date` (optional)
- `end_date` (optional)

#### GET /api/analytics/balance-trend
Get balance trend over time.

**Query Parameters:**
- `months` (optional, default: 6)

#### GET /api/analytics/income-expenses
Get income vs expenses.

**Query Parameters:**
- `months` (optional, default: 6)

#### GET /api/analytics/summary
Get summary statistics.

**Response:**
```json
{
  "totalBalance": 250000.00,
  "monthlyIncome": 5420.00,
  "monthlyExpenses": 2950.00,
  "netBalance": 2470.00
}
```

### Admin

All admin endpoints require admin role.

#### GET /api/admin/users
Get all users.

#### GET /api/admin/accounts
Get all accounts.

#### GET /api/admin/audit-logs
Get audit logs.

#### POST /api/admin/reset-data
Reset mock data.

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message"
}
```

Status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

