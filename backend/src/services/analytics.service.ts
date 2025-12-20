import pool from '../database/connection';
import { TransactionCategory } from '../types/transaction';

export interface SpendingByCategory {
  category: TransactionCategory;
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

export class AnalyticsService {
  async getSpendingByCategory(userId: string, startDate?: string, endDate?: string): Promise<SpendingByCategory[]> {
    let query = `
      SELECT 
        t.category,
        SUM(ABS(t.amount)) as amount
      FROM transactions t
      INNER JOIN accounts a ON t.account_id = a.id
      WHERE a.user_id = $1 AND t.amount < 0 AND t.status = 'completed'
    `;
    const params: any[] = [userId];
    let paramCount = 2;

    if (startDate) {
      query += ` AND t.date >= $${paramCount++}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND t.date <= $${paramCount++}`;
      params.push(endDate);
    }

    query += ' GROUP BY t.category ORDER BY amount DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  async getBalanceTrend(userId: string, months: number = 6): Promise<BalanceTrend[]> {
    // This is a simplified version - in production, you'd want to track balance history
    const result = await pool.query(
      `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', t.date), 'Mon') as month,
        SUM(t.amount) as balance_change
      FROM transactions t
      INNER JOIN accounts a ON t.account_id = a.id
      WHERE a.user_id = $1 
        AND t.status = 'completed'
        AND t.date >= CURRENT_DATE - INTERVAL '${months} months'
      GROUP BY DATE_TRUNC('month', t.date)
      ORDER BY DATE_TRUNC('month', t.date) ASC
      `,
      [userId]
    );

    // Calculate running balance
    let runningBalance = 0;
    return result.rows.map((row: any) => {
      runningBalance += parseFloat(row.balance_change);
      return {
        month: row.month,
        balance: runningBalance,
      };
    });
  }

  async getIncomeExpenses(userId: string, months: number = 6): Promise<IncomeExpenses[]> {
    const result = await pool.query(
      `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', t.date), 'Mon') as month,
        SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) as income,
        SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END) as expenses
      FROM transactions t
      INNER JOIN accounts a ON t.account_id = a.id
      WHERE a.user_id = $1 
        AND t.status = 'completed'
        AND t.date >= CURRENT_DATE - INTERVAL '${months} months'
      GROUP BY DATE_TRUNC('month', t.date)
      ORDER BY DATE_TRUNC('month', t.date) ASC
      `,
      [userId]
    );

    return result.rows.map((row: any) => ({
      month: row.month,
      income: parseFloat(row.income) || 0,
      expenses: parseFloat(row.expenses) || 0,
    }));
  }

  async getTotalBalance(userId: string): Promise<number> {
    const result = await pool.query(
      'SELECT SUM(balance) as total FROM accounts WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );
    return parseFloat(result.rows[0].total) || 0;
  }

  async getMonthlyIncome(userId: string): Promise<number> {
    const result = await pool.query(
      `
      SELECT SUM(t.amount) as income
      FROM transactions t
      INNER JOIN accounts a ON t.account_id = a.id
      WHERE a.user_id = $1 
        AND t.amount > 0 
        AND t.status = 'completed'
        AND t.date >= DATE_TRUNC('month', CURRENT_DATE)
      `,
      [userId]
    );
    return parseFloat(result.rows[0].income) || 0;
  }

  async getMonthlyExpenses(userId: string): Promise<number> {
    const result = await pool.query(
      `
      SELECT SUM(ABS(t.amount)) as expenses
      FROM transactions t
      INNER JOIN accounts a ON t.account_id = a.id
      WHERE a.user_id = $1 
        AND t.amount < 0 
        AND t.status = 'completed'
        AND t.date >= DATE_TRUNC('month', CURRENT_DATE)
      `,
      [userId]
    );
    return parseFloat(result.rows[0].expenses) || 0;
  }

  async getSpendingPredictions(userId: string, months: number = 3): Promise<{
    category: string;
    predictedAmount: number;
    averageAmount: number;
    confidence: number;
  }[]> {
    // Get average spending by category over the last N months
    const result = await pool.query(
      `
      SELECT 
        t.category,
        AVG(ABS(t.amount)) as average_amount,
        COUNT(*) as transaction_count
      FROM transactions t
      INNER JOIN accounts a ON t.account_id = a.id
      WHERE a.user_id = $1 
        AND t.amount < 0 
        AND t.status = 'completed'
        AND t.date >= CURRENT_DATE - INTERVAL '${months} months'
      GROUP BY t.category
      ORDER BY average_amount DESC
      `,
      [userId]
    );

    return result.rows.map((row: any) => {
      const avgAmount = parseFloat(row.average_amount) || 0;
      const txCount = parseInt(row.transaction_count) || 0;
      
      // Simple prediction: average monthly spending per category
      // Confidence based on number of transactions (more transactions = higher confidence)
      const confidence = Math.min(100, Math.max(50, (txCount / months) * 20));
      
      return {
        category: row.category,
        predictedAmount: avgAmount,
        averageAmount: avgAmount,
        confidence: Math.round(confidence),
      };
    });
  }
}

export default new AnalyticsService();

