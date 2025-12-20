import apiClient from '../lib/api-client';

export interface Alert {
  id: string;
  accountId: string;
  type: string;
  threshold: number;
  isActive: boolean;
  accountName?: string;
  accountNumber?: string;
}

export interface CreateAlertData {
  accountId: string;
  type: string;
  threshold: number;
}

export const alertsService = {
  async getAll(): Promise<Alert[]> {
    const response = await apiClient.get<{ alerts: any[] }>('/alerts');
    return (response.data?.alerts || []).map((a: any) => ({
      id: a.id,
      accountId: a.account_id,
      type: a.type,
      threshold: parseFloat(a.threshold || 0),
      isActive: a.is_active,
      accountName: a.account_name,
      accountNumber: a.account_number,
    }));
  },

  async getById(id: string): Promise<Alert> {
    const response = await apiClient.get<any>(`/alerts/${id}`);
    return {
      id: response.data.id,
      accountId: response.data.account_id,
      type: response.data.type,
      threshold: parseFloat(response.data.threshold || 0),
      isActive: response.data.is_active,
    };
  },

  async create(data: CreateAlertData): Promise<Alert> {
    const response = await apiClient.post<any>('/alerts', {
      accountId: data.accountId,
      type: data.type,
      threshold: data.threshold,
    });
    return {
      id: response.data.id,
      accountId: response.data.account_id,
      type: response.data.type,
      threshold: parseFloat(response.data.threshold || 0),
      isActive: response.data.is_active,
    };
  },

  async update(id: string, data: { threshold?: number; isActive?: boolean }): Promise<Alert> {
    const response = await apiClient.put<any>(`/alerts/${id}`, {
      threshold: data.threshold,
      isActive: data.isActive,
    });
    return {
      id: response.data.id,
      accountId: response.data.account_id,
      type: response.data.type,
      threshold: parseFloat(response.data.threshold || 0),
      isActive: response.data.is_active,
    };
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/alerts/${id}`);
  },
};

