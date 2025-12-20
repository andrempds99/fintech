import { Router } from 'express';
import { body } from 'express-validator';
import alertsController from '../controllers/alerts.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', alertsController.getAll.bind(alertsController));

router.get('/:id', alertsController.getById.bind(alertsController));

router.post(
  '/',
  validate([
    body('accountId').isUUID(),
    body('type').isIn(['low_balance', 'large_transaction']),
    body('threshold').isFloat({ min: 0 }),
  ]),
  alertsController.create.bind(alertsController)
);

router.put(
  '/:id',
  validate([
    body('threshold').optional().isFloat({ min: 0 }),
    body('isActive').optional().isBoolean(),
  ]),
  alertsController.update.bind(alertsController)
);

router.delete('/:id', alertsController.delete.bind(alertsController));

export default router;

