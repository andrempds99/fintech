import auditRepository from '../repositories/audit.repository';

export class AuditService {
  async log(
    action: string,
    details?: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await auditRepository.create({
      userId,
      action,
      details,
      ipAddress,
      userAgent,
    });
  }

  async getAll(limit: number = 100, offset: number = 0) {
    const logs = await auditRepository.findAll(limit, offset);
    const total = await auditRepository.count();

    return {
      logs,
      total,
      limit,
      offset,
    };
  }

  async getByUserId(userId: string, limit: number = 100, offset: number = 0) {
    const logs = await auditRepository.findByUserId(userId, limit, offset);
    return {
      logs,
      limit,
      offset,
    };
  }
}

export default new AuditService();

