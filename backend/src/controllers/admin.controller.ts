import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import accountService from '../services/account.service';
import auditService from '../services/audit.service';
import { AppError } from '../middleware/error.middleware';
import { seedDatabase } from '../database/seed';

export class AdminController {
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const result = await userService.getAll(limit, offset);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAllAccounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const result = await accountService.getAll(limit, offset);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const result = await auditService.getAll(limit, offset);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // This would truncate tables and reseed
      // For safety, we'll just reseed without truncating in this implementation
      await seedDatabase();
      res.json({ message: 'Mock data reset successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();

