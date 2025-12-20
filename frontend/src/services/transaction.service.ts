import apiClient from '../lib/api-client';
import { Transaction } from '../lib/mock-data';
import { mapTransaction } from '../utils/api-mappers';

export interface TransactionFilters {
  account_id?: string;
  category?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
}

export const transactionService = {
  async getAll(filters?: TransactionFilters): Promise<TransactionListResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await apiClient.get<any>(
      `/transactions?${params.toString()}`
    );
    return {
      ...response.data,
      transactions: (response.data?.transactions || []).map(mapTransaction),
    };
  },

  async getById(id: string): Promise<Transaction> {
    const response = await apiClient.get<any>(`/transactions/${id}`);
    return mapTransaction(response.data);
  },

  async create(data: {
    account_id: string;
    date: string;
    merchant: string;
    category: string;
    amount: number;
    status?: string;
  }): Promise<Transaction> {
    const response = await apiClient.post<Transaction>('/transactions', data);
    return response.data;
  },
};

