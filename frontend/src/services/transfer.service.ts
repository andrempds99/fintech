import apiClient from '../lib/api-client';

export interface CreateTransferData {
  fromAccountId: string;
  toAccountId?: string; // For transfers between own accounts
  toAccountNumber?: string; // For transfers to other users' accounts
  amount: number;
  description?: string;
}

export interface TransferResponse {
  fromTransaction: any;
  toTransaction: any;
  fromAccount: any;
  toAccount: any;
}

export const transferService = {
  async create(data: CreateTransferData): Promise<TransferResponse> {
    const response = await apiClient.post<TransferResponse>('/transfers', data);
    return response.data;
  },
};

