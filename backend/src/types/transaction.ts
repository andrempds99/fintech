export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type TransactionCategory =
  | 'groceries'
  | 'dining'
  | 'transportation'
  | 'utilities'
  | 'entertainment'
  | 'shopping'
  | 'healthcare'
  | 'transfer'
  | 'salary'
  | 'investment';

export interface Transaction {
  id: string;
  account_id: string;
  date: Date;
  merchant: string;
  category: TransactionCategory;
  amount: number;
  status: TransactionStatus;
  created_at: Date;
  updated_at?: Date;
}

export interface CreateTransactionDto {
  account_id: string;
  date: string;
  merchant: string;
  category: TransactionCategory;
  amount: number;
  status?: TransactionStatus;
}

export interface TransactionFilters {
  account_id?: string;
  category?: TransactionCategory;
  status?: TransactionStatus;
  start_date?: string;
  end_date?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

