import pool from '../database/connection';

export interface ScheduledTransfer {
  id: string;
  user_id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  description?: string;
  frequency: string;
  next_execution_date: Date;
  end_date?: Date;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class ScheduledTransfersRepository {
  async findByUserId(userId: string): Promise<ScheduledTransfer[]> {
    const result = await pool.query(
      `SELECT st.*, 
       fa.name as from_account_name, fa.account_number as from_account_number,
       ta.name as to_account_name, ta.account_number as to_account_number
       FROM scheduled_transfers st
       JOIN accounts fa ON st.from_account_id = fa.id
       JOIN accounts ta ON st.to_account_id = ta.id
       WHERE st.user_id = $1 
       ORDER BY st.next_execution_date ASC`,
      [userId]
    );
    return result.rows;
  }

  async findById(id: string): Promise<ScheduledTransfer | null> {
    const result = await pool.query('SELECT * FROM scheduled_transfers WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findDueTransfers(): Promise<ScheduledTransfer[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await pool.query(
      `SELECT * FROM scheduled_transfers 
       WHERE is_active = true 
       AND next_execution_date <= $1
       AND (end_date IS NULL OR end_date >= $1)`,
      [today]
    );
    return result.rows;
  }

  async create(transferData: {
    userId: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description?: string;
    frequency: string;
    nextExecutionDate: Date;
    endDate?: Date;
    isActive?: boolean;
  }): Promise<ScheduledTransfer> {
    const result = await pool.query(
      `INSERT INTO scheduled_transfers (user_id, from_account_id, to_account_id, amount, description, frequency, next_execution_date, end_date, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        transferData.userId,
        transferData.fromAccountId,
        transferData.toAccountId,
        transferData.amount,
        transferData.description || null,
        transferData.frequency,
        transferData.nextExecutionDate,
        transferData.endDate || null,
        transferData.isActive !== undefined ? transferData.isActive : true,
      ]
    );
    return result.rows[0];
  }

  async update(id: string, updates: {
    amount?: number;
    description?: string;
    frequency?: string;
    nextExecutionDate?: Date;
    endDate?: Date;
    isActive?: boolean;
  }): Promise<ScheduledTransfer> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.amount !== undefined) {
      fields.push(`amount = $${paramCount++}`);
      values.push(updates.amount);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.frequency !== undefined) {
      fields.push(`frequency = $${paramCount++}`);
      values.push(updates.frequency);
    }
    if (updates.nextExecutionDate !== undefined) {
      fields.push(`next_execution_date = $${paramCount++}`);
      values.push(updates.nextExecutionDate);
    }
    if (updates.endDate !== undefined) {
      fields.push(`end_date = $${paramCount++}`);
      values.push(updates.endDate);
    }
    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updates.isActive);
    }

    if (fields.length === 0) {
      const transfer = await this.findById(id);
      if (!transfer) throw new Error('Scheduled transfer not found');
      return transfer;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE scheduled_transfers SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM scheduled_transfers WHERE id = $1', [id]);
  }
}

export default new ScheduledTransfersRepository();

