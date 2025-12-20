import { Router } from 'express';
import { body } from 'express-validator';
import transfersController from '../controllers/transfers.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post(
  '/',
  validate([
    body('fromAccountId').isUUID(),
    body('toAccountId').optional().isUUID(),
    body('toAccountNumber').optional().isString().trim(),
    body('amount').isFloat({ min: 0.01 }),
    body('description').optional().trim(),
    body().custom((value) => {
      // Ensure either toAccountId or toAccountNumber is provided, but not both
      if (!value.toAccountId && !value.toAccountNumber) {
        throw new Error('Either toAccountId or toAccountNumber must be provided');
      }
      if (value.toAccountId && value.toAccountNumber) {
        throw new Error('Cannot provide both toAccountId and toAccountNumber');
      }
      return true;
    }),
  ]),
  transfersController.create.bind(transfersController)
);

export default router;

