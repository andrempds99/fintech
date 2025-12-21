import pool from '../database/connection';
import { Account } from '../types/account';

export class AccountRepository {
  async findByUserId(userId: string): Promise<Account[]> {
    const result = await pool.query(
      'SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  async findById(id: string): Promise<Account | null> {
    const result = await pool.query('SELECT * FROM accounts WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findByAccountNumber(accountNumber: string): Promise<Account | null> {
    // Normalize the account number - allow both full format (****1234) and just last 4 digits (1234)
    const normalized = accountNumber.trim();
    let query: string;
    let params: string[];
    
    if (normalized.startsWith('****')) {
      // Full format provided - exact match
      query = 'SELECT * FROM accounts WHERE account_number = $1';
      params = [normalized];
    } else if (/^\d{4}$/.test(normalized)) {
      // Just last 4 digits provided - match accounts ending with these digits
      query = 'SELECT * FROM accounts WHERE account_number = $1 OR account_number LIKE $2';
      params = [normalized, `****${normalized}`];
    } else {
      // Try exact match
      query = 'SELECT * FROM accounts WHERE account_number = $1';
      params = [normalized];
    }
    
    const result = await pool.query(query, params);
    // If multiple results, prefer exact match with **** prefix
    if (result.rows.length > 1) {
      const exactMatch = result.rows.find((row: Account) => row.account_number === `****${normalized}`);
      return exactMatch || result.rows[0];
    }
    return result.rows[0] || null;
  }

  async create(accountData: {
    userId: string;
    name: string;
    type: string;
    balance?: number;
    currency?: string;
    status?: string;
    accountNumber: string;
    limit?: number;
  }): Promise<Account> {
    const result = await pool.query(
      `INSERT INTO accounts (user_id, name, type, balance, currency, status, account_number, "limit")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        accountData.userId,
        accountData.name,
        accountData.type,
        accountData.balance || 0,
        accountData.currency || 'USD',
        accountData.status || 'active',
        accountData.accountNumber,
        accountData.limit || null,
      ]
    );
    return result.rows[0];
  }

  async updateBalance(id: string, newBalance: number): Promise<Account> {
    const result = await pool.query(
      'UPDATE accounts SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [newBalance, id]
    );
    return result.rows[0];
  }

  async updateStatus(id: string, status: string): Promise<Account> {
    const result = await pool.query(
      'UPDATE accounts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }

  async findAll(limit: number = 100, offset: number = 0): Promise<Account[]> {
    const result = await pool.query(
      'SELECT * FROM accounts ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  async findActiveAccounts(): Promise<Account[]> {
    const result = await pool.query(
      'SELECT a.*, u.name as user_name, u.email as user_email FROM accounts a JOIN users u ON a.user_id = u.id WHERE a.status = $1 ORDER BY a.created_at DESC',
      ['active']
    );
    return result.rows;
  }

  async count(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) FROM accounts');
    return parseInt(result.rows[0].count, 10);
  }

  async delete(id: string, userId: string): Promise<void> {
    // Verify ownership and balance
    const account = await this.findById(id);
    if (!account) {
      throw new Error('Account not found');
    }
    if (account.user_id !== userId) {
      throw new Error('Access denied');
    }
    if (parseFloat(account.balance.toString()) !== 0) {
      throw new Error('Cannot delete account with non-zero balance');
    }
    
    await pool.query('DELETE FROM accounts WHERE id = $1', [id]);
  }

  async setHighlight(id: string, userId: string, isHighlighted: boolean): Promise<Account> {
    // Verify ownership
    const account = await this.findById(id);
    if (!account) {
      throw new Error('Account not found');
    }
    if (account.user_id !== userId) {
      throw new Error('Access denied');
    }

    // If setting this account as highlighted, unhighlight all other accounts for this user
    if (isHighlighted) {
      await pool.query(
        'UPDATE accounts SET is_highlighted = false, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1',
        [userId]
      );
    }

    const result = await pool.query(
      'UPDATE accounts SET is_highlighted = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [isHighlighted, id]
    );
    return result.rows[0];
  }

  async findHighlighted(userId: string): Promise<Account | null> {
    const result = await pool.query(
      'SELECT * FROM accounts WHERE user_id = $1 AND is_highlighted = true LIMIT 1',
      [userId]
    );
    return result.rows[0] || null;
  }
}

export default new AccountRepository();

