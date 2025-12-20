import { Account, Transaction } from '../lib/mock-data';

// Map API account response to frontend Account type
export function mapAccount(apiAccount: any): Account {
  if (!apiAccount) {
    throw new Error('Invalid account data');
  }
  return {
    id: apiAccount.id,
    name: apiAccount.name || '',
    type: apiAccount.type || '',
    balance: parseFloat(apiAccount.balance || 0),
    currency: apiAccount.currency || 'USD',
    status: apiAccount.status || 'active',
    accountNumber: apiAccount.account_number || '',
    limit: apiAccount.limit ? parseFloat(apiAccount.limit) : undefined,
  };
}

// Map API transaction response to frontend Transaction type
export function mapTransaction(apiTransaction: any): Transaction {
  if (!apiTransaction) {
    throw new Error('Invalid transaction data');
  }
  return {
    id: apiTransaction.id,
    date: apiTransaction.date,
    merchant: apiTransaction.merchant || '',
    category: apiTransaction.category || '',
    amount: parseFloat(apiTransaction.amount || 0),
    status: apiTransaction.status || 'pending',
    accountId: apiTransaction.account_id,
  };
}

