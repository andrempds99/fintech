import { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.post(
  '/register',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('role').optional().isIn(['user', 'admin']),
  ]),
  authController.register.bind(authController)
);

router.post(
  '/login',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ]),
  authController.login.bind(authController)
);

router.post(
  '/refresh',
  validate([body('refreshToken').notEmpty()]),
  authController.refresh.bind(authController)
);

router.post(
  '/forgot-password',
  validate([body('email').isEmail().normalizeEmail()]),
  authController.forgotPassword.bind(authController)
);

router.post(
  '/reset-password',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('newPassword').isLength({ min: 6 }),
    body('resetToken').notEmpty(),
  ]),
  authController.resetPassword.bind(authController)
);

export default router;

