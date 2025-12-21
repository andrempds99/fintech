import apiClient from '../lib/api-client';
import { Account } from '../lib/mock-data';
import { mapAccount } from '../utils/api-mappers';

export const accountService = {
  async getAll(): Promise<Account[]> {
    const response = await apiClient.get<{ accounts: any[] }>('/accounts');
    return (response.data?.accounts || []).map(mapAccount);
  },

  async getById(id: string): Promise<Account> {
    const response = await apiClient.get<any>(`/accounts/${id}`);
    return mapAccount(response.data);
  },

  async create(data: {
    name: string;
    type: string;
    currency?: string;
    limit?: number;
  }): Promise<Account> {
    const response = await apiClient.post<any>('/accounts', data);
    return mapAccount(response.data);
  },

  async getActiveForTransfers(): Promise<Account[]> {
    const response = await apiClient.get<{ accounts: any[] }>('/accounts/active/transfers');
    return (response.data?.accounts || []).map(mapAccount);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/accounts/${id}`);
  },

  async setHighlight(id: string, isHighlighted: boolean): Promise<Account> {
    const response = await apiClient.patch<any>(`/accounts/${id}/highlight`, { isHighlighted });
    return mapAccount(response.data);
  },
};

