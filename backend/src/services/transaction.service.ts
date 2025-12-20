import transactionRepository from '../repositories/transaction.repository';
import { CreateTransactionDto, TransactionFilters, Transaction } from '../types/transaction';
import { AppError } from '../middleware/error.middleware';
import accountRepository from '../repositories/account.repository';
import alertsService from './alerts.service';
import logger from '../utils/logger';

export class TransactionService {
  async create(transactionData: CreateTransactionDto): Promise<Transaction> {
    // Verify account exists
    const account = await accountRepository.findById(transactionData.account_id);
    if (!account) {
      throw new AppError('Account not found', 404);
    }

    // Create transaction
    const transaction = await transactionRepository.create({
      accountId: transactionData.account_id,
      date: new Date(transactionData.date),
      merchant: transactionData.merchant,
      category: transactionData.category,
      amount: transactionData.amount,
      status: transactionData.status || 'pending',
    });

    // If transaction is completed, update account balance
    if (transaction.status === 'completed') {
      const newBalance = parseFloat(account.balance.toString()) + transactionData.amount;
      await accountRepository.updateBalance(transactionData.account_id, newBalance);
      
      // Check alerts asynchronously (don't block transaction creation)
      alertsService.checkAlerts(transactionData.account_id, transactionData.amount)
        .then(triggeredAlerts => {
          if (triggeredAlerts.length > 0) {
            logger.info('Alerts triggered', {
              accountId: transactionData.account_id,
              triggeredCount: triggeredAlerts.length,
              alerts: triggeredAlerts.map(a => ({ type: a.alert.type, threshold: a.alert.threshold }))
            });
          }
        })
        .catch(err => {
          logger.error('Error checking alerts', { error: err, accountId: transactionData.account_id });
        });
    }

    return transaction;
  }

  async getByAccountId(accountId: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    return transactionRepository.findByAccountId(accountId, limit, offset);
  }

  async getWithFilters(filters: TransactionFilters & { account_ids?: string[] }) {
    const transactions = await transactionRepository.findWithFilters(filters);
    const total = await transactionRepository.countWithFilters(filters);

    return {
      transactions,
      total,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    };
  }

  async getById(id: string): Promise<Transaction> {
    const transaction = await transactionRepository.findById(id);
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }
    return transaction;
  }

  async updateStatus(id: string, status: string): Promise<Transaction> {
    const transaction = await this.getById(id);

    // If changing to completed, update account balance
    if (status === 'completed' && transaction.status !== 'completed') {
      const account = await accountRepository.findById(transaction.account_id);
      if (account) {
        const newBalance = parseFloat(account.balance.toString()) + parseFloat(transaction.amount.toString());
        await accountRepository.updateBalance(transaction.account_id, newBalance);
      }
    }

    return transactionRepository.updateStatus(id, status);
  }
}

export default new TransactionService();

