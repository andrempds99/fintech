import { Router } from 'express';
import { body } from 'express-validator';
import usersController from '../controllers/users.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/me', usersController.getMe.bind(usersController));

router.put(
  '/me',
  validate([
    body('name').optional().trim().notEmpty(),
    body('avatar').optional().trim(),
  ]),
  usersController.updateMe.bind(usersController)
);

export default router;

