import apiClient from '../lib/api-client';

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  targetDate?: string;
  status: string;
}

export interface CreateGoalData {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  category: string;
  targetDate?: string;
}

export const goalsService = {
  async getAll(): Promise<Goal[]> {
    const response = await apiClient.get<{ goals: any[] }>('/goals');
    return (response.data?.goals || []).map((g: any) => ({
      id: g.id,
      name: g.name,
      targetAmount: parseFloat(g.target_amount || 0),
      currentAmount: parseFloat(g.current_amount || 0),
      category: g.category,
      targetDate: g.target_date,
      status: g.status,
    }));
  },

  async getById(id: string): Promise<Goal> {
    const response = await apiClient.get<any>(`/goals/${id}`);
    return {
      id: response.data.id,
      name: response.data.name,
      targetAmount: parseFloat(response.data.target_amount || 0),
      currentAmount: parseFloat(response.data.current_amount || 0),
      category: response.data.category,
      targetDate: response.data.target_date,
      status: response.data.status,
    };
  },

  async create(data: CreateGoalData): Promise<Goal> {
    const response = await apiClient.post<any>('/goals', {
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      category: data.category,
      targetDate: data.targetDate,
    });
    return {
      id: response.data.id,
      name: response.data.name,
      targetAmount: parseFloat(response.data.target_amount || 0),
      currentAmount: parseFloat(response.data.current_amount || 0),
      category: response.data.category,
      targetDate: response.data.target_date,
      status: response.data.status,
    };
  },

  async update(id: string, data: Partial<CreateGoalData & { status?: string }>): Promise<Goal> {
    const response = await apiClient.put<any>(`/goals/${id}`, {
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      category: data.category,
      targetDate: data.targetDate,
      status: data.status,
    });
    return {
      id: response.data.id,
      name: response.data.name,
      targetAmount: parseFloat(response.data.target_amount || 0),
      currentAmount: parseFloat(response.data.current_amount || 0),
      category: response.data.category,
      targetDate: response.data.target_date,
      status: response.data.status,
    };
  },

  async updateProgress(id: string, amount: number): Promise<Goal> {
    const response = await apiClient.patch<any>(`/goals/${id}/progress`, { amount });
    return {
      id: response.data.id,
      name: response.data.name,
      targetAmount: parseFloat(response.data.target_amount || 0),
      currentAmount: parseFloat(response.data.current_amount || 0),
      category: response.data.category,
      targetDate: response.data.target_date,
      status: response.data.status,
    };
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/goals/${id}`);
  },
};

