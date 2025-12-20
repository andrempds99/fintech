import { Request, Response, NextFunction } from 'express';
import transferService from '../services/transfer.service';
import { AppError } from '../middleware/error.middleware';

export class TransfersController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const result = await transferService.execute(req.user.userId, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new TransfersController();

