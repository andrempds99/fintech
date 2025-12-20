import { Request, Response, NextFunction } from 'express';
import alertsService from '../services/alerts.service';
import { AppError } from '../middleware/error.middleware';

export class AlertsController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const alerts = await alertsService.getByUserId(req.user.userId);
      res.json({ alerts });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const alert = await alertsService.getById(req.params.id, req.user.userId);
      res.json(alert);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const alert = await alertsService.create(req.user.userId, req.body);
      res.status(201).json(alert);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const alert = await alertsService.update(req.params.id, req.user.userId, req.body);
      res.json(alert);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      await alertsService.delete(req.params.id, req.user.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new AlertsController();

