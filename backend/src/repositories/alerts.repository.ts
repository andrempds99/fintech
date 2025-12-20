import pool from '../database/connection';

export interface Alert {
  id: string;
  user_id: string;
  account_id: string;
  type: string;
  threshold: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class AlertsRepository {
  async findByUserId(userId: string): Promise<Alert[]> {
    const result = await pool.query(
      `SELECT a.*, acc.name as account_name, acc.account_number 
       FROM alerts a 
       JOIN accounts acc ON a.account_id = acc.id 
       WHERE a.user_id = $1 
       ORDER BY a.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async findById(id: string): Promise<Alert | null> {
    const result = await pool.query('SELECT * FROM alerts WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findActiveAlerts(): Promise<Alert[]> {
    const result = await pool.query(
      `SELECT a.*, u.email as user_email, acc.name as account_name, acc.balance, acc.account_number
       FROM alerts a
       JOIN users u ON a.user_id = u.id
       JOIN accounts acc ON a.account_id = acc.id
       WHERE a.is_active = true`
    );
    return result.rows;
  }

  async create(alertData: {
    userId: string;
    accountId: string;
    type: string;
    threshold: number;
    isActive?: boolean;
  }): Promise<Alert> {
    const result = await pool.query(
      `INSERT INTO alerts (user_id, account_id, type, threshold, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        alertData.userId,
        alertData.accountId,
        alertData.type,
        alertData.threshold,
        alertData.isActive !== undefined ? alertData.isActive : true,
      ]
    );
    return result.rows[0];
  }

  async update(id: string, updates: {
    threshold?: number;
    isActive?: boolean;
  }): Promise<Alert> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.threshold !== undefined) {
      fields.push(`threshold = $${paramCount++}`);
      values.push(updates.threshold);
    }
    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updates.isActive);
    }

    if (fields.length === 0) {
      const alert = await this.findById(id);
      if (!alert) throw new Error('Alert not found');
      return alert;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE alerts SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM alerts WHERE id = $1', [id]);
  }
}

export default new AlertsRepository();

