import { Router } from 'express';
import { body } from 'express-validator';
import accountsController from '../controllers/accounts.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', accountsController.getAll.bind(accountsController));

router.get('/active/transfers', accountsController.getActiveForTransfers.bind(accountsController));

router.get('/:id', accountsController.getById.bind(accountsController));

router.post(
  '/',
  validate([
    body('name').trim().notEmpty(),
    body('type').trim().notEmpty(),
    body('currency').optional().isLength({ min: 3, max: 3 }),
    body('limit').optional().isNumeric(),
  ]),
  accountsController.create.bind(accountsController)
);

export default router;

