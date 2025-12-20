import { Request, Response, NextFunction } from 'express';
import auditService from '../services/audit.service';
import logger from '../utils/logger';

export function auditLog(action: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to log after response
    res.json = function (body: any) {
      // Log the action
      auditService.log(
        action,
        JSON.stringify({ method: req.method, path: req.path, body: req.body }),
        req.user?.userId,
        req.ip,
        req.get('user-agent')
      ).catch((err) => {
        logger.error('Audit logging failed', { error: err, action, path: req.path });
      });

      return originalJson(body);
    };

    next();
  };
}

