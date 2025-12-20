import pool from '../database/connection';
import { User } from '../types/user';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(userData: {
    email: string;
    passwordHash: string;
    name: string;
    role?: string;
    avatar?: string;
  }): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, avatar)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, avatar, created_at, last_login`,
      [
        userData.email,
        userData.passwordHash,
        userData.name,
        userData.role || 'user',
        userData.avatar || null,
      ]
    );
    return result.rows[0];
  }

  async updateLastLogin(id: string): Promise<void> {
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [id]);
  }

  async update(id: string, updates: { name?: string; avatar?: string }): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.avatar !== undefined) {
      fields.push(`avatar = $${paramCount++}`);
      values.push(updates.avatar);
    }

    if (fields.length === 0) {
      const user = await this.findById(id);
      if (!user) throw new Error('User not found');
      return user;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  async findAll(limit: number = 100, offset: number = 0): Promise<User[]> {
    const result = await pool.query(
      'SELECT id, email, name, role, avatar, created_at, last_login FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  async count(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count, 10);
  }
}

export default new UserRepository();

