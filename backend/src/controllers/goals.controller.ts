import { Request, Response, NextFunction } from 'express';
import goalsService from '../services/goals.service';
import { AppError } from '../middleware/error.middleware';

export class GoalsController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const goals = await goalsService.getByUserId(req.user.userId);
      res.json({ goals });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const goal = await goalsService.getById(req.params.id, req.user.userId);
      res.json(goal);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const goal = await goalsService.create(req.user.userId, req.body);
      res.status(201).json(goal);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const goal = await goalsService.update(req.params.id, req.user.userId, req.body);
      res.json(goal);
    } catch (error) {
      next(error);
    }
  }

  async updateProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { amount } = req.body;
      if (typeof amount !== 'number') {
        throw new AppError('Amount must be a number', 400);
      }

      const goal = await goalsService.updateProgress(req.params.id, req.user.userId, amount);
      res.json(goal);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      await goalsService.delete(req.params.id, req.user.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new GoalsController();

