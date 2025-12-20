export type AccountStatus = 'active' | 'suspended' | 'closed';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  status: AccountStatus;
  account_number: string;
  limit?: number;
  created_at: Date;
  updated_at?: Date;
}

export interface CreateAccountDto {
  name: string;
  type: string;
  currency?: string;
  limit?: number;
}

