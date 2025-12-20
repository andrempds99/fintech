import { Router } from 'express';
import { body } from 'express-validator';
import transactionsController from '../controllers/transactions.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', transactionsController.getAll.bind(transactionsController));

router.get('/:id', transactionsController.getById.bind(transactionsController));

router.post(
  '/',
  validate([
    body('account_id').isUUID(),
    body('date').isISO8601(),
    body('merchant').trim().notEmpty(),
    body('category').isIn([
      'groceries',
      'dining',
      'transportation',
      'utilities',
      'entertainment',
      'shopping',
      'healthcare',
      'transfer',
      'salary',
      'investment',
    ]),
    body('amount').isNumeric(),
    body('status').optional().isIn(['pending', 'completed', 'failed']),
  ]),
  transactionsController.create.bind(transactionsController)
);

export default router;

