import { Router } from 'express';
import { body } from 'express-validator';
import goalsController from '../controllers/goals.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', goalsController.getAll.bind(goalsController));

router.get('/:id', goalsController.getById.bind(goalsController));

router.post(
  '/',
  validate([
    body('name').trim().notEmpty(),
    body('targetAmount').isFloat({ min: 0.01 }),
    body('category').isIn(['emergency_fund', 'vacation', 'down_payment', 'debt_payoff', 'education', 'retirement', 'other']),
    body('targetDate').optional().isISO8601(),
    body('currentAmount').optional().isFloat({ min: 0 }),
  ]),
  goalsController.create.bind(goalsController)
);

router.put(
  '/:id',
  validate([
    body('name').optional().trim().notEmpty(),
    body('targetAmount').optional().isFloat({ min: 0.01 }),
    body('currentAmount').optional().isFloat({ min: 0 }),
    body('category').optional().isIn(['emergency_fund', 'vacation', 'down_payment', 'debt_payoff', 'education', 'retirement', 'other']),
    body('targetDate').optional().isISO8601(),
    body('status').optional().isIn(['active', 'completed', 'paused', 'cancelled']),
  ]),
  goalsController.update.bind(goalsController)
);

router.patch(
  '/:id/progress',
  validate([
    body('amount').isFloat(),
  ]),
  goalsController.updateProgress.bind(goalsController)
);

router.delete('/:id', goalsController.delete.bind(goalsController));

export default router;

