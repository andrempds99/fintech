import scheduledTransfersRepository from '../repositories/scheduled-transfers.repository';
import accountRepository from '../repositories/account.repository';
import transferService from './transfer.service';
import { AppError } from '../middleware/error.middleware';

export interface CreateScheduledTransferDto {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
  frequency: string;
  nextExecutionDate: string;
  endDate?: string;
}

export class ScheduledTransfersService {
  async create(userId: string, transferData: CreateScheduledTransferDto) {
    // Verify account ownership
    const fromAccount = await accountRepository.findById(transferData.fromAccountId);
    if (!fromAccount) {
      throw new AppError('Source account not found', 404);
    }
    if (fromAccount.user_id !== userId) {
      throw new AppError('Access denied to source account', 403);
    }

    // Verify destination account exists
    const toAccount = await accountRepository.findById(transferData.toAccountId);
    if (!toAccount) {
      throw new AppError('Destination account not found', 404);
    }

    return scheduledTransfersRepository.create({
      userId,
      fromAccountId: transferData.fromAccountId,
      toAccountId: transferData.toAccountId,
      amount: transferData.amount,
      description: transferData.description,
      frequency: transferData.frequency,
      nextExecutionDate: new Date(transferData.nextExecutionDate),
      endDate: transferData.endDate ? new Date(transferData.endDate) : undefined,
    });
  }

  async getByUserId(userId: string) {
    return scheduledTransfersRepository.findByUserId(userId);
  }

  async getById(id: string, userId: string) {
    const transfer = await scheduledTransfersRepository.findById(id);
    if (!transfer) {
      throw new AppError('Scheduled transfer not found', 404);
    }
    if (transfer.user_id !== userId) {
      throw new AppError('Access denied', 403);
    }
    return transfer;
  }

  async update(id: string, userId: string, updates: {
    amount?: number;
    description?: string;
    frequency?: string;
    nextExecutionDate?: string;
    endDate?: string;
    isActive?: boolean;
  }) {
    const transfer = await scheduledTransfersRepository.findById(id);
    if (!transfer) {
      throw new AppError('Scheduled transfer not found', 404);
    }
    if (transfer.user_id !== userId) {
      throw new AppError('Access denied', 403);
    }

    return scheduledTransfersRepository.update(id, {
      amount: updates.amount,
      description: updates.description,
      frequency: updates.frequency,
      nextExecutionDate: updates.nextExecutionDate ? new Date(updates.nextExecutionDate) : undefined,
      endDate: updates.endDate ? new Date(updates.endDate) : undefined,
      isActive: updates.isActive,
    });
  }

  async delete(id: string, userId: string) {
    const transfer = await scheduledTransfersRepository.findById(id);
    if (!transfer) {
      throw new AppError('Scheduled transfer not found', 404);
    }
    if (transfer.user_id !== userId) {
      throw new AppError('Access denied', 403);
    }
    await scheduledTransfersRepository.delete(id);
  }

  async executeDueTransfers() {
    const dueTransfers = await scheduledTransfersRepository.findDueTransfers();
    const results = [];

    for (const transfer of dueTransfers) {
      try {
        // Execute the transfer
        await transferService.execute(transfer.user_id, {
          fromAccountId: transfer.from_account_id,
          toAccountId: transfer.to_account_id,
          amount: parseFloat(transfer.amount.toString()),
          description: transfer.description || `Scheduled transfer (${transfer.frequency})`,
        });

        // Calculate next execution date
        const nextDate = this.calculateNextExecutionDate(
          new Date(transfer.next_execution_date),
          transfer.frequency
        );

        // Check if we should continue (end date check)
        const shouldContinue = !transfer.end_date || nextDate <= new Date(transfer.end_date);

        if (shouldContinue) {
          await scheduledTransfersRepository.update(transfer.id, {
            nextExecutionDate: nextDate,
          });
        } else {
          await scheduledTransfersRepository.update(transfer.id, {
            isActive: false,
          });
        }

        results.push({ transferId: transfer.id, success: true });
      } catch (error) {
        results.push({ transferId: transfer.id, success: false, error });
      }
    }

    return results;
  }

  private calculateNextExecutionDate(currentDate: Date, frequency: string): Date {
    const next = new Date(currentDate);
    
    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      default:
        next.setDate(next.getDate() + 1);
    }
    
    return next;
  }
}

export default new ScheduledTransfersService();

