import { Request, Response, NextFunction } from 'express';
import scheduledTransfersService from '../services/scheduled-transfers.service';
import { AppError } from '../middleware/error.middleware';

export class ScheduledTransfersController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const transfers = await scheduledTransfersService.getByUserId(req.user.userId);
      res.json({ transfers });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const transfer = await scheduledTransfersService.getById(req.params.id, req.user.userId);
      res.json(transfer);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const transfer = await scheduledTransfersService.create(req.user.userId, req.body);
      res.status(201).json(transfer);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const transfer = await scheduledTransfersService.update(req.params.id, req.user.userId, req.body);
      res.json(transfer);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      await scheduledTransfersService.delete(req.params.id, req.user.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async executeDue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // This endpoint can be called by a cron job or admin
      // For now, allow any authenticated user (in production, restrict to admin)
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const results = await scheduledTransfersService.executeDueTransfers();
      res.json({ 
        executed: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results 
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ScheduledTransfersController();

