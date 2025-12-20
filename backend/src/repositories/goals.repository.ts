import pool from '../database/connection';

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  category: string;
  target_date?: Date;
  status: string;
  created_at?: Date;
  updated_at?: Date;
}

export class GoalsRepository {
  async findByUserId(userId: string): Promise<Goal[]> {
    const result = await pool.query(
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  async findById(id: string): Promise<Goal | null> {
    const result = await pool.query('SELECT * FROM goals WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(goalData: {
    userId: string;
    name: string;
    targetAmount: number;
    currentAmount?: number;
    category: string;
    targetDate?: Date;
    status?: string;
  }): Promise<Goal> {
    const result = await pool.query(
      `INSERT INTO goals (user_id, name, target_amount, current_amount, category, target_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        goalData.userId,
        goalData.name,
        goalData.targetAmount,
        goalData.currentAmount || 0,
        goalData.category,
        goalData.targetDate || null,
        goalData.status || 'active',
      ]
    );
    return result.rows[0];
  }

  async update(id: string, updates: {
    name?: string;
    targetAmount?: number;
    currentAmount?: number;
    category?: string;
    targetDate?: Date;
    status?: string;
  }): Promise<Goal> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.targetAmount !== undefined) {
      fields.push(`target_amount = $${paramCount++}`);
      values.push(updates.targetAmount);
    }
    if (updates.currentAmount !== undefined) {
      fields.push(`current_amount = $${paramCount++}`);
      values.push(updates.currentAmount);
    }
    if (updates.category !== undefined) {
      fields.push(`category = $${paramCount++}`);
      values.push(updates.category);
    }
    if (updates.targetDate !== undefined) {
      fields.push(`target_date = $${paramCount++}`);
      values.push(updates.targetDate);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }

    if (fields.length === 0) {
      const goal = await this.findById(id);
      if (!goal) throw new Error('Goal not found');
      return goal;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE goals SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM goals WHERE id = $1', [id]);
  }
}

export default new GoalsRepository();

