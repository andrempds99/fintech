import { Router } from 'express';
import exportController from '../controllers/export.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/transactions/csv', exportController.exportCSV.bind(exportController));
router.get('/transactions/pdf', exportController.exportPDF.bind(exportController));

export default router;

