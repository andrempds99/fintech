import alertsRepository from '../repositories/alerts.repository';
import accountRepository from '../repositories/account.repository';
import { AppError } from '../middleware/error.middleware';

export interface CreateAlertDto {
  accountId: string;
  type: string;
  threshold: number;
}

export class AlertsService {
  async create(userId: string, alertData: CreateAlertDto) {
    // Verify account ownership
    const account = await accountRepository.findById(alertData.accountId);
    if (!account) {
      throw new AppError('Account not found', 404);
    }
    if (account.user_id !== userId) {
      throw new AppError('Access denied', 403);
    }

    return alertsRepository.create({
      userId,
      accountId: alertData.accountId,
      type: alertData.type,
      threshold: alertData.threshold,
    });
  }

  async getByUserId(userId: string) {
    return alertsRepository.findByUserId(userId);
  }

  async getById(id: string, userId: string) {
    const alert = await alertsRepository.findById(id);
    if (!alert) {
      throw new AppError('Alert not found', 404);
    }
    if (alert.user_id !== userId) {
      throw new AppError('Access denied', 403);
    }
    return alert;
  }

  async update(id: string, userId: string, updates: {
    threshold?: number;
    isActive?: boolean;
  }) {
    const alert = await alertsRepository.findById(id);
    if (!alert) {
      throw new AppError('Alert not found', 404);
    }
    if (alert.user_id !== userId) {
      throw new AppError('Access denied', 403);
    }

    return alertsRepository.update(id, {
      threshold: updates.threshold,
      isActive: updates.isActive,
    });
  }

  async delete(id: string, userId: string) {
    const alert = await alertsRepository.findById(id);
    if (!alert) {
      throw new AppError('Alert not found', 404);
    }
    if (alert.user_id !== userId) {
      throw new AppError('Access denied', 403);
    }
    await alertsRepository.delete(id);
  }

  async checkAlerts(accountId: string, transactionAmount?: number) {
    const alerts = await alertsRepository.findActiveAlerts();
    const accountAlerts = alerts.filter(a => a.account_id === accountId);
    const triggeredAlerts: any[] = [];

    for (const alert of accountAlerts) {
      const account = await accountRepository.findById(alert.account_id);
      if (!account) continue;

      const balance = parseFloat(account.balance.toString());
      const threshold = parseFloat(alert.threshold.toString());

      if (alert.type === 'low_balance' && balance <= threshold) {
        triggeredAlerts.push({
          alert,
          account,
          message: `Low balance alert: Account ${account.account_number} balance is $${balance.toFixed(2)}, below threshold of $${threshold.toFixed(2)}`,
        });
      } else if (alert.type === 'large_transaction' && transactionAmount && Math.abs(transactionAmount) >= threshold) {
        triggeredAlerts.push({
          alert,
          account,
          message: `Large transaction alert: Transaction of $${Math.abs(transactionAmount).toFixed(2)} exceeds threshold of $${threshold.toFixed(2)}`,
        });
      }
    }

    return triggeredAlerts;
  }
}

export default new AlertsService();

