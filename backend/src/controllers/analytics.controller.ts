import { Request, Response, NextFunction } from 'express';
import analyticsService from '../services/analytics.service';
import { AppError } from '../middleware/error.middleware';

export class AnalyticsController {
  async getSpendingByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const spending = await analyticsService.getSpendingByCategory(
        req.user.userId,
        req.query.start_date as string,
        req.query.end_date as string
      );
      res.json({ spending });
    } catch (error) {
      next(error);
    }
  }

  async getBalanceTrend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const months = parseInt(req.query.months as string) || 6;
      const trend = await analyticsService.getBalanceTrend(req.user.userId, months);
      res.json({ trend });
    } catch (error) {
      next(error);
    }
  }

  async getIncomeExpenses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const months = parseInt(req.query.months as string) || 6;
      const data = await analyticsService.getIncomeExpenses(req.user.userId, months);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const [totalBalance, monthlyIncome, monthlyExpenses] = await Promise.all([
        analyticsService.getTotalBalance(req.user.userId),
        analyticsService.getMonthlyIncome(req.user.userId),
        analyticsService.getMonthlyExpenses(req.user.userId),
      ]);

      res.json({
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        netBalance: monthlyIncome - monthlyExpenses,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSpendingPredictions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const months = parseInt(req.query.months as string) || 3;
      const predictions = await analyticsService.getSpendingPredictions(req.user.userId, months);
      res.json({ predictions });
    } catch (error) {
      next(error);
    }
  }
}

export default new AnalyticsController();

