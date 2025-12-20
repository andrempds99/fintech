import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/spending', analyticsController.getSpendingByCategory.bind(analyticsController));

router.get('/balance-trend', analyticsController.getBalanceTrend.bind(analyticsController));

router.get('/income-expenses', analyticsController.getIncomeExpenses.bind(analyticsController));

router.get('/summary', analyticsController.getSummary.bind(analyticsController));

router.get('/predictions', analyticsController.getSpendingPredictions.bind(analyticsController));

export default router;

