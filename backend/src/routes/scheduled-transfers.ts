import { Router } from 'express';
import { body } from 'express-validator';
import scheduledTransfersController from '../controllers/scheduled-transfers.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', scheduledTransfersController.getAll.bind(scheduledTransfersController));

router.get('/:id', scheduledTransfersController.getById.bind(scheduledTransfersController));

router.post(
  '/',
  validate([
    body('fromAccountId').isUUID(),
    body('toAccountId').isUUID(),
    body('amount').isFloat({ min: 0.01 }),
    body('frequency').isIn(['daily', 'weekly', 'monthly']),
    body('nextExecutionDate').isISO8601(),
    body('endDate').optional().isISO8601(),
    body('description').optional().trim(),
  ]),
  scheduledTransfersController.create.bind(scheduledTransfersController)
);

router.put(
  '/:id',
  validate([
    body('amount').optional().isFloat({ min: 0.01 }),
    body('frequency').optional().isIn(['daily', 'weekly', 'monthly']),
    body('nextExecutionDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('isActive').optional().isBoolean(),
    body('description').optional().trim(),
  ]),
  scheduledTransfersController.update.bind(scheduledTransfersController)
);

router.delete('/:id', scheduledTransfersController.delete.bind(scheduledTransfersController));

router.post('/execute-due', scheduledTransfersController.executeDue.bind(scheduledTransfersController));

export default router;

