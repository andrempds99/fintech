import apiClient from '../lib/api-client';

export interface SpendingByCategory {
  category: string;
  amount: number;
}

export interface BalanceTrend {
  month: string;
  balance: number;
}

export interface IncomeExpenses {
  month: string;
  income: number;
  expenses: number;
}

export interface AnalyticsSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netBalance: number;
}

export const analyticsService = {
  async getSpendingByCategory(startDate?: string, endDate?: string): Promise<SpendingByCategory[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await apiClient.get<{ spending: SpendingByCategory[] }>(
      `/analytics/spending?${params.toString()}`
    );
    return response.data.spending;
  },

  async getBalanceTrend(months: number = 6): Promise<BalanceTrend[]> {
    const response = await apiClient.get<{ trend: BalanceTrend[] }>(
      `/analytics/balance-trend?months=${months}`
    );
    return response.data.trend;
  },

  async getIncomeExpenses(months: number = 6): Promise<IncomeExpenses[]> {
    const response = await apiClient.get<{ data: IncomeExpenses[] }>(
      `/analytics/income-expenses?months=${months}`
    );
    return response.data.data;
  },

  async getSummary(): Promise<AnalyticsSummary> {
    const response = await apiClient.get<AnalyticsSummary>('/analytics/summary');
    return response.data;
  },

  async getSpendingPredictions(months: number = 3): Promise<{
    category: string;
    predictedAmount: number;
    averageAmount: number;
    confidence: number;
  }[]> {
    const response = await apiClient.get<{ predictions: any[] }>(
      `/analytics/predictions?months=${months}`
    );
    return response.data.predictions || [];
  },
};

