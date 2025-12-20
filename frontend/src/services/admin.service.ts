import apiClient from '../lib/api-client';
import { User, Account, AuditLog } from '../lib/mock-data';
import { mapAccount } from '../utils/api-mappers';

export interface PaginatedResponse<T> {
  users?: T[];
  accounts?: T[];
  logs?: T[];
  total: number;
  limit: number;
  offset: number;
}

export const adminService = {
  async getAllUsers(limit: number = 100, offset: number = 0): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>(
      `/admin/users?limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  async getAllAccounts(limit: number = 100, offset: number = 0): Promise<PaginatedResponse<Account>> {
    const response = await apiClient.get<any>(
      `/admin/accounts?limit=${limit}&offset=${offset}`
    );
    return {
      ...response.data,
      accounts: response.data.accounts?.map(mapAccount) || [],
    };
  },

  async getAuditLogs(limit: number = 100, offset: number = 0): Promise<PaginatedResponse<AuditLog>> {
    const response = await apiClient.get<PaginatedResponse<AuditLog>>(
      `/admin/audit-logs?limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  async resetData(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/admin/reset-data');
    return response.data;
  },
};

