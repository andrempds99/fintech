import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { AppError } from '../middleware/error.middleware';

export class UsersController {
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const user = await userService.getById(req.user.userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const user = await userService.update(req.user.userId, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export default new UsersController();

