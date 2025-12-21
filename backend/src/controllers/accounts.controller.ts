import { Request, Response, NextFunction } from 'express';
import accountService from '../services/account.service';
import { AppError } from '../middleware/error.middleware';

export class AccountsController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const accounts = await accountService.getByUserId(req.user.userId);
      res.json({ accounts });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const account = await accountService.getById(req.params.id, req.user.userId);
      res.json(account);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const account = await accountService.create(req.user.userId, req.body);
      res.status(201).json(account);
    } catch (error) {
      next(error);
    }
  }

  async getActiveForTransfers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const accounts = await accountService.getActiveAccountsForTransfers(req.user.userId);
      res.json({ accounts });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      await accountService.delete(req.params.id, req.user.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async setHighlight(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { isHighlighted } = req.body;
      if (typeof isHighlighted !== 'boolean') {
        throw new AppError('isHighlighted must be a boolean', 400);
      }

      const account = await accountService.setHighlight(req.params.id, req.user.userId, isHighlighted);
      res.json(account);
    } catch (error) {
      next(error);
    }
  }
}

export default new AccountsController();

