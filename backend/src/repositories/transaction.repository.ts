import pool from '../database/connection';
import { Transaction, TransactionFilters } from '../types/transaction';

export class TransactionRepository {
  async findByAccountId(accountId: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE account_id = $1 ORDER BY date DESC, created_at DESC LIMIT $2 OFFSET $3',
      [accountId, limit, offset]
    );
    return result.rows;
  }

  async findById(id: string): Promise<Transaction | null> {
    const result = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findWithFilters(filters: TransactionFilters & { account_ids?: string[] }): Promise<Transaction[]> {
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (filters.account_ids && filters.account_ids.length > 0) {
      query += ` AND account_id = ANY($${paramCount++}::uuid[])`;
      params.push(filters.account_ids);
    } else if (filters.account_id) {
      query += ` AND account_id = $${paramCount++}`;
      params.push(filters.account_id);
    }

    if (filters.category) {
      query += ` AND category = $${paramCount++}`;
      params.push(filters.category);
    }

    if (filters.status) {
      query += ` AND status = $${paramCount++}`;
      params.push(filters.status);
    }

    if (filters.start_date) {
      query += ` AND date >= $${paramCount++}`;
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ` AND date <= $${paramCount++}`;
      params.push(filters.end_date);
    }

    if (filters.search) {
      query += ` AND merchant ILIKE $${paramCount++}`;
      params.push(`%${filters.search}%`);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramCount++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ` OFFSET $${paramCount++}`;
      params.push(filters.offset);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  async countWithFilters(filters: TransactionFilters & { account_ids?: string[] }): Promise<number> {
    let query = 'SELECT COUNT(*) FROM transactions WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (filters.account_ids && filters.account_ids.length > 0) {
      query += ` AND account_id = ANY($${paramCount++}::uuid[])`;
      params.push(filters.account_ids);
    } else if (filters.account_id) {
      query += ` AND account_id = $${paramCount++}`;
      params.push(filters.account_id);
    }

    if (filters.category) {
      query += ` AND category = $${paramCount++}`;
      params.push(filters.category);
    }

    if (filters.status) {
      query += ` AND status = $${paramCount++}`;
      params.push(filters.status);
    }

    if (filters.start_date) {
      query += ` AND date >= $${paramCount++}`;
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ` AND date <= $${paramCount++}`;
      params.push(filters.end_date);
    }

    if (filters.search) {
      query += ` AND merchant ILIKE $${paramCount++}`;
      params.push(`%${filters.search}%`);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  async create(transactionData: {
    accountId: string;
    date: Date;
    merchant: string;
    category: string;
    amount: number;
    status?: string;
  }): Promise<Transaction> {
    const result = await pool.query(
      `INSERT INTO transactions (account_id, date, merchant, category, amount, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        transactionData.accountId,
        transactionData.date,
        transactionData.merchant,
        transactionData.category,
        transactionData.amount,
        transactionData.status || 'pending',
      ]
    );
    return result.rows[0];
  }

  async updateStatus(id: string, status: string): Promise<Transaction> {
    const result = await pool.query(
      'UPDATE transactions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }
}

export default new TransactionRepository();

