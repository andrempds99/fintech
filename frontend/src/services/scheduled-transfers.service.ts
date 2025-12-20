import apiClient from '../lib/api-client';

export interface ScheduledTransfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
  frequency: string;
  nextExecutionDate: string;
  endDate?: string;
  isActive: boolean;
  fromAccountName?: string;
  toAccountName?: string;
}

export interface CreateScheduledTransferData {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
  frequency: string;
  nextExecutionDate: string;
  endDate?: string;
}

export const scheduledTransfersService = {
  async getAll(): Promise<ScheduledTransfer[]> {
    const response = await apiClient.get<{ transfers: any[] }>('/scheduled-transfers');
    return (response.data?.transfers || []).map((t: any) => ({
      id: t.id,
      fromAccountId: t.from_account_id,
      toAccountId: t.to_account_id,
      amount: parseFloat(t.amount || 0),
      description: t.description,
      frequency: t.frequency,
      nextExecutionDate: t.next_execution_date,
      endDate: t.end_date,
      isActive: t.is_active,
      fromAccountName: t.from_account_name,
      toAccountName: t.to_account_name,
    }));
  },

  async getById(id: string): Promise<ScheduledTransfer> {
    const response = await apiClient.get<any>(`/scheduled-transfers/${id}`);
    return {
      id: response.data.id,
      fromAccountId: response.data.from_account_id,
      toAccountId: response.data.to_account_id,
      amount: parseFloat(response.data.amount || 0),
      description: response.data.description,
      frequency: response.data.frequency,
      nextExecutionDate: response.data.next_execution_date,
      endDate: response.data.end_date,
      isActive: response.data.is_active,
    };
  },

  async create(data: CreateScheduledTransferData): Promise<ScheduledTransfer> {
    const response = await apiClient.post<any>('/scheduled-transfers', {
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      amount: data.amount,
      description: data.description,
      frequency: data.frequency,
      nextExecutionDate: data.nextExecutionDate,
      endDate: data.endDate,
    });
    return {
      id: response.data.id,
      fromAccountId: response.data.from_account_id,
      toAccountId: response.data.to_account_id,
      amount: parseFloat(response.data.amount || 0),
      description: response.data.description,
      frequency: response.data.frequency,
      nextExecutionDate: response.data.next_execution_date,
      endDate: response.data.end_date,
      isActive: response.data.is_active,
    };
  },

  async update(id: string, data: Partial<CreateScheduledTransferData & { isActive?: boolean }>): Promise<ScheduledTransfer> {
    const response = await apiClient.put<any>(`/scheduled-transfers/${id}`, {
      amount: data.amount,
      description: data.description,
      frequency: data.frequency,
      nextExecutionDate: data.nextExecutionDate,
      endDate: data.endDate,
      isActive: data.isActive,
    });
    return {
      id: response.data.id,
      fromAccountId: response.data.from_account_id,
      toAccountId: response.data.to_account_id,
      amount: parseFloat(response.data.amount || 0),
      description: response.data.description,
      frequency: response.data.frequency,
      nextExecutionDate: response.data.next_execution_date,
      endDate: response.data.end_date,
      isActive: response.data.is_active,
    };
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/scheduled-transfers/${id}`);
  },
};

