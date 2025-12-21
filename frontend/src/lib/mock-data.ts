export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type AccountStatus = 'active' | 'suspended' | 'closed';
export type TransactionCategory = 'groceries' | 'dining' | 'transportation' | 'utilities' | 'entertainment' | 'shopping' | 'healthcare' | 'transfer' | 'salary' | 'investment';

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  status: AccountStatus;
  accountNumber: string;
  limit?: number;
  isHighlighted?: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: TransactionCategory;
  amount: number;
  status: TransactionStatus;
  accountId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

// Mock Accounts
export const mockAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Premium Checking',
    type: 'Checking',
    balance: 24580.50,
    currency: 'USD',
    status: 'active',
    accountNumber: '****4521',
    limit: 50000
  },
  {
    id: 'acc-2',
    name: 'Savings Plus',
    type: 'Savings',
    balance: 58420.75,
    currency: 'USD',
    status: 'active',
    accountNumber: '****7832',
  },
  {
    id: 'acc-3',
    name: 'Investment Portfolio',
    type: 'Investment',
    balance: 125340.20,
    currency: 'USD',
    status: 'active',
    accountNumber: '****2194',
  },
  {
    id: 'acc-4',
    name: 'Business Account',
    type: 'Business',
    balance: 43200.00,
    currency: 'USD',
    status: 'active',
    accountNumber: '****8765',
    limit: 100000
  },
  {
    id: 'acc-5',
    name: 'Old Checking',
    type: 'Checking',
    balance: 0,
    currency: 'USD',
    status: 'closed',
    accountNumber: '****3421',
  }
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'txn-1',
    date: '2024-12-20',
    merchant: 'Whole Foods Market',
    category: 'groceries',
    amount: -156.32,
    status: 'completed',
    accountId: 'acc-1'
  },
  {
    id: 'txn-2',
    date: '2024-12-19',
    merchant: 'Spotify Premium',
    category: 'entertainment',
    amount: -15.99,
    status: 'completed',
    accountId: 'acc-1'
  },
  {
    id: 'txn-3',
    date: '2024-12-19',
    merchant: 'Amazon.com',
    category: 'shopping',
    amount: -89.47,
    status: 'completed',
    accountId: 'acc-1'
  },
  {
    id: 'txn-4',
    date: '2024-12-18',
    merchant: 'Uber',
    category: 'transportation',
    amount: -24.50,
    status: 'completed',
    accountId: 'acc-1'
  },
  {
    id: 'txn-5',
    date: '2024-12-18',
    merchant: 'Starbucks',
    category: 'dining',
    amount: -8.45,
    status: 'completed',
    accountId: 'acc-1'
  },
  {
    id: 'txn-6',
    date: '2024-12-17',
    merchant: 'Electric Company',
    category: 'utilities',
    amount: -142.80,
    status: 'completed',
    accountId: 'acc-1'
  },
  {
    id: 'txn-7',
    date: '2024-12-15',
    merchant: 'Monthly Salary',
    category: 'salary',
    amount: 5420.00,
    status: 'completed',
    accountId: 'acc-1'
  },
  {
    id: 'txn-8',
    date: '2024-12-14',
    merchant: 'Apple Store',
    category: 'shopping',
    amount: -1299.00,
    status: 'completed',
    accountId: 'acc-1'
  },
  {
    id: 'txn-9',
    date: '2024-12-13',
    merchant: 'Chipotle Mexican Grill',
    category: 'dining',
    amount: -18.75,
    status: 'pending',
    accountId: 'acc-1'
  },
  {
    id: 'txn-10',
    date: '2024-12-12',
    merchant: 'Target',
    category: 'shopping',
    amount: -67.89,
    status: 'completed',
    accountId: 'acc-1'
  },
  {
    id: 'txn-11',
    date: '2024-12-12',
    merchant: 'CVS Pharmacy',
    category: 'healthcare',
    amount: -45.20,
    status: 'completed',
    accountId: 'acc-1'
  },
  {
    id: 'txn-12',
    date: '2024-12-10',
    merchant: 'Netflix',
    category: 'entertainment',
    amount: -19.99,
    status: 'completed',
    accountId: 'acc-1'
  },
  {
    id: 'txn-13',
    date: '2024-12-08',
    merchant: 'Shell Gas Station',
    category: 'transportation',
    amount: -52.30,
    status: 'completed',
    accountId: 'acc-1'
  },
  {
    id: 'txn-14',
    date: '2024-12-05',
    merchant: 'Transfer to Savings',
    category: 'transfer',
    amount: -1000.00,
    status: 'completed',
    accountId: 'acc-1'
  },
  {
    id: 'txn-15',
    date: '2024-12-03',
    merchant: 'Costco Wholesale',
    category: 'groceries',
    amount: -234.56,
    status: 'completed',
    accountId: 'acc-1'
  },
  {
    id: 'txn-16',
    date: '2024-12-05',
    merchant: 'Transfer from Checking',
    category: 'transfer',
    amount: 1000.00,
    status: 'completed',
    accountId: 'acc-2'
  },
  {
    id: 'txn-17',
    date: '2024-11-15',
    merchant: 'Interest Payment',
    category: 'investment',
    amount: 245.30,
    status: 'completed',
    accountId: 'acc-2'
  },
];

// Mock Users (for admin dashboard)
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    avatar: 'SJ',
    role: 'user',
    createdAt: '2023-06-15',
    lastLogin: '2024-12-20'
  },
  {
    id: 'user-2',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    avatar: 'MC',
    role: 'user',
    createdAt: '2023-08-22',
    lastLogin: '2024-12-19'
  },
  {
    id: 'user-3',
    name: 'Emma Williams',
    email: 'emma.williams@example.com',
    avatar: 'EW',
    role: 'admin',
    createdAt: '2022-03-10',
    lastLogin: '2024-12-20'
  },
  {
    id: 'user-4',
    name: 'James Martinez',
    email: 'james.martinez@example.com',
    avatar: 'JM',
    role: 'user',
    createdAt: '2024-01-05',
    lastLogin: '2024-12-18'
  },
  {
    id: 'user-5',
    name: 'Olivia Brown',
    email: 'olivia.brown@example.com',
    avatar: 'OB',
    role: 'user',
    createdAt: '2023-11-20',
    lastLogin: '2024-12-17'
  }
];

// Mock Audit Logs
export const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    timestamp: '2024-12-20 14:32:15',
    action: 'User Login',
    user: 'sarah.johnson@example.com',
    details: 'Successful login from IP 192.168.1.1'
  },
  {
    id: 'audit-2',
    timestamp: '2024-12-20 13:15:42',
    action: 'Transaction Created',
    user: 'michael.chen@example.com',
    details: 'Transfer of $500.00 to acc-****7832'
  },
  {
    id: 'audit-3',
    timestamp: '2024-12-20 11:08:23',
    action: 'Account Status Changed',
    user: 'emma.williams@example.com',
    details: 'Account acc-****3421 marked as closed'
  },
  {
    id: 'audit-4',
    timestamp: '2024-12-20 09:45:10',
    action: 'User Created',
    user: 'admin@example.com',
    details: 'New user created: james.martinez@example.com'
  },
  {
    id: 'audit-5',
    timestamp: '2024-12-19 16:22:33',
    action: 'Password Reset',
    user: 'olivia.brown@example.com',
    details: 'Password reset requested and completed'
  },
  {
    id: 'audit-6',
    timestamp: '2024-12-19 14:10:55',
    action: 'Failed Login Attempt',
    user: 'unknown@example.com',
    details: 'Failed login from IP 10.0.0.5'
  }
];

// Chart data for balance trend
export const balanceTrendData = [
  { month: 'Jun', balance: 18500 },
  { month: 'Jul', balance: 21200 },
  { month: 'Aug', balance: 19800 },
  { month: 'Sep', balance: 23400 },
  { month: 'Oct', balance: 22100 },
  { month: 'Nov', balance: 24800 },
  { month: 'Dec', balance: 24580 },
];

// Spending by category data
export const spendingByCategoryData = [
  { category: 'Groceries', amount: 890, fill: 'var(--chart-1)' },
  { category: 'Dining', amount: 456, fill: 'var(--chart-2)' },
  { category: 'Shopping', amount: 1234, fill: 'var(--chart-3)' },
  { category: 'Transportation', amount: 378, fill: 'var(--chart-4)' },
  { category: 'Utilities', amount: 543, fill: 'var(--chart-5)' },
  { category: 'Entertainment', amount: 245, fill: '#8b5cf6' },
];

// Monthly income vs expenses
export const incomeExpensesData = [
  { month: 'Jun', income: 5420, expenses: 3200 },
  { month: 'Jul', income: 5420, expenses: 2900 },
  { month: 'Aug', income: 5420, expenses: 3500 },
  { month: 'Sep', income: 5420, expenses: 2700 },
  { month: 'Oct', income: 5420, expenses: 3100 },
  { month: 'Nov', income: 5420, expenses: 2400 },
  { month: 'Dec', income: 5420, expenses: 2950 },
];

// Category icons mapping
export const categoryIcons: Record<TransactionCategory, string> = {
  groceries: 'ShoppingCart',
  dining: 'UtensilsCrossed',
  transportation: 'Car',
  utilities: 'Zap',
  entertainment: 'Sparkles',
  shopping: 'ShoppingBag',
  healthcare: 'Heart',
  transfer: 'ArrowLeftRight',
  salary: 'Briefcase',
  investment: 'TrendingUp',
};

// Current user (for demo)
export const currentUser: User = {
  id: 'user-1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@example.com',
  avatar: 'SJ',
  role: 'user',
  createdAt: '2023-06-15',
  lastLogin: '2024-12-20'
};
