import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from '../auth/password';

const categories = [
  'groceries',
  'dining',
  'transportation',
  'utilities',
  'entertainment',
  'shopping',
  'healthcare',
  'transfer',
  'salary',
  'investment',
];

const merchants = {
  groceries: ['Whole Foods Market', 'Costco Wholesale', 'Target', 'Walmart', 'Trader Joe\'s'],
  dining: ['Starbucks', 'Chipotle Mexican Grill', 'McDonald\'s', 'Subway', 'Olive Garden'],
  transportation: ['Uber', 'Lyft', 'Shell Gas Station', 'Exxon', 'Metro Transit'],
  utilities: ['Electric Company', 'Water Department', 'Internet Provider', 'Gas Company'],
  entertainment: ['Netflix', 'Spotify Premium', 'Movie Theater', 'Concert Tickets'],
  shopping: ['Amazon.com', 'Apple Store', 'Best Buy', 'Nike', 'Home Depot'],
  healthcare: ['CVS Pharmacy', 'Walgreens', 'Hospital', 'Dentist', 'Pharmacy'],
  transfer: ['Transfer to Savings', 'Transfer from Checking', 'Bank Transfer'],
  salary: ['Monthly Salary', 'Payroll', 'Employer Payment'],
  investment: ['Interest Payment', 'Dividend Payment', 'Investment Return'],
};

const accountTypes = ['Checking', 'Savings', 'Investment', 'Business', 'Credit'];

export function generateAccountNumber(): string {
  return `****${Math.floor(1000 + Math.random() * 9000)}`;
}

export function generateName(): string {
  const firstNames = ['Sarah', 'Michael', 'Emma', 'James', 'Olivia', 'David', 'Sophia', 'Robert', 'Isabella', 'William'];
  const lastNames = ['Johnson', 'Chen', 'Williams', 'Martinez', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

export function generateEmail(name: string): string {
  const normalized = name.toLowerCase().replace(/\s+/g, '.');
  const domains = ['example.com', 'test.com', 'demo.com'];
  return `${normalized}@${domains[Math.floor(Math.random() * domains.length)]}`;
}

export function generateAvatar(name: string): string {
  const parts = name.split(' ');
  return `${parts[0][0]}${parts[1] ? parts[1][0] : ''}`.toUpperCase();
}

export async function generateUser(role: 'user' | 'admin' = 'user') {
  const name = generateName();
  return {
    email: generateEmail(name),
    password: 'password123', // Default password for all mock users
    passwordHash: await hashPassword('password123'),
    name,
    role,
    avatar: generateAvatar(name),
  };
}

export function generateAccount(userId: string, index: number) {
  const accountNames = [
    'Premium Checking',
    'Savings Plus',
    'Investment Portfolio',
    'Business Account',
    'Basic Checking',
    'High Yield Savings',
  ];

  const types = accountTypes;
  const statuses: Array<'active' | 'suspended' | 'closed'> = ['active', 'active', 'active', 'closed'];

  return {
    userId,
    name: accountNames[index % accountNames.length] || `Account ${index + 1}`,
    type: types[index % types.length],
    balance: Math.random() * 100000 + 1000,
    currency: 'USD',
    status: statuses[Math.floor(Math.random() * statuses.length)],
    accountNumber: generateAccountNumber(),
    limit: Math.random() > 0.7 ? Math.random() * 50000 + 10000 : null,
  };
}

export function generateTransaction(accountId: string, date: Date) {
  const category = categories[Math.floor(Math.random() * categories.length)] as any;
  const categoryMerchants = merchants[category as keyof typeof merchants] || ['Merchant'];
  const merchant = categoryMerchants[Math.floor(Math.random() * categoryMerchants.length)];

  let amount: number;
  if (category === 'salary' || category === 'investment') {
    amount = Math.random() * 5000 + 1000; // Positive for income
  } else if (category === 'transfer') {
    amount = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 2000 + 500);
  } else {
    amount = -(Math.random() * 200 + 10); // Negative for expenses
  }

  const statuses: Array<'pending' | 'completed' | 'failed'> = ['completed', 'completed', 'completed', 'pending', 'failed'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    accountId,
    date,
    merchant,
    category,
    amount: Math.round(amount * 100) / 100, // Round to 2 decimals
    status,
  };
}

export function generateTransactionsForAccount(accountId: string, count: number, startDate: Date) {
  const transactions = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    // Generate dates in the past
    const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
    const date = new Date(startDate);
    date.setDate(date.getDate() - daysAgo);

    transactions.push(generateTransaction(accountId, date));
  }

  // Sort by date descending
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

