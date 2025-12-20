import { Request, Response, NextFunction } from 'express';
import transactionService from '../services/transaction.service';
import { AppError } from '../middleware/error.middleware';
import accountRepository from '../repositories/account.repository';

export class TransactionsController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const filters: any = {
        limit: parseInt(req.query.limit as string) || 50,
        offset: parseInt(req.query.offset as string) || 0,
      };

      // Get all user's account IDs
      const accounts = await accountRepository.findByUserId(req.user.userId);
      if (accounts.length === 0) {
        res.json({ transactions: [], total: 0, limit: filters.limit, offset: filters.offset });
        return;
      }

      const accountIds = accounts.map(acc => acc.id);

      // If account_id provided, verify ownership
      if (req.query.account_id) {
        if (!accountIds.includes(req.query.account_id as string)) {
          throw new AppError('Access denied', 403);
        }
        filters.account_id = req.query.account_id;
      } else {
        // Filter by all user's accounts
        (filters as any).account_ids = accountIds;
      }

      if (req.query.category) filters.category = req.query.category;
      if (req.query.status) filters.status = req.query.status;
      if (req.query.start_date) filters.start_date = req.query.start_date;
      if (req.query.end_date) filters.end_date = req.query.end_date;
      if (req.query.search) filters.search = req.query.search;

      const result = await transactionService.getWithFilters(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const transaction = await transactionService.getById(req.params.id);
      
      // Verify ownership through account
      const account = await accountRepository.findById(transaction.account_id);
      if (!account || account.user_id !== req.user.userId) {
        throw new AppError('Access denied', 403);
      }

      res.json(transaction);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      // Verify account ownership
      const account = await accountRepository.findById(req.body.account_id);
      if (!account || account.user_id !== req.user.userId) {
        throw new AppError('Access denied', 403);
      }

      const transaction = await transactionService.create(req.body);
      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  }
}

export default new TransactionsController();

