import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/users', adminController.getAllUsers.bind(adminController));

router.get('/accounts', adminController.getAllAccounts.bind(adminController));

router.get('/audit-logs', adminController.getAuditLogs.bind(adminController));

router.post('/reset-data', adminController.resetData.bind(adminController));

export default router;

