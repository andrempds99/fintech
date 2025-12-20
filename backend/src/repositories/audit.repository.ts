import pool from '../database/connection';

export interface AuditLog {
  id: string;
  timestamp: Date;
  user_id?: string;
  action: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
}

export class AuditRepository {
  async create(logData: {
    userId?: string;
    action: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    const result = await pool.query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        logData.userId || null,
        logData.action,
        logData.details || null,
        logData.ipAddress || null,
        logData.userAgent || null,
      ]
    );
    return result.rows[0];
  }

  async findAll(limit: number = 100, offset: number = 0): Promise<AuditLog[]> {
    const result = await pool.query(
      'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  async findByUserId(userId: string, limit: number = 100, offset: number = 0): Promise<AuditLog[]> {
    const result = await pool.query(
      'SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
    return result.rows;
  }

  async count(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) FROM audit_logs');
    return parseInt(result.rows[0].count, 10);
  }
}

export default new AuditRepository();

