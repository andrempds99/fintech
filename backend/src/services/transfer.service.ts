import accountRepository from '../repositories/account.repository';
import transactionRepository from '../repositories/transaction.repository';
import { AppError } from '../middleware/error.middleware';

export interface CreateTransferDto {
  fromAccountId: string;
  toAccountId?: string; // For transfers between own accounts
  toAccountNumber?: string; // For transfers to other users' accounts
  amount: number;
  description?: string;
}

export class TransferService {
  async execute(userId: string, transferData: CreateTransferDto): Promise<{
    fromTransaction: any;
    toTransaction: any;
    fromAccount: any;
    toAccount: any;
  }> {
    const { fromAccountId, toAccountId, toAccountNumber, amount, description } = transferData;

    // Validate amount
    if (amount <= 0) {
      throw new AppError('Transfer amount must be greater than 0', 400);
    }

    // Validate that either toAccountId or toAccountNumber is provided, but not both
    if (!toAccountId && !toAccountNumber) {
      throw new AppError('Either toAccountId or toAccountNumber must be provided', 400);
    }
    if (toAccountId && toAccountNumber) {
      throw new AppError('Cannot provide both toAccountId and toAccountNumber', 400);
    }

    // Get source account
    const fromAccount = await accountRepository.findById(fromAccountId);
    if (!fromAccount) {
      throw new AppError('Source account not found', 404);
    }

    // Verify ownership of from account (user must own the source account)
    if (fromAccount.user_id !== userId) {
      throw new AppError('Access denied to source account', 403);
    }

    // Get destination account
    let toAccount;
    if (toAccountId) {
      // Transfer between own accounts
      toAccount = await accountRepository.findById(toAccountId);
      if (!toAccount) {
        throw new AppError('Destination account not found', 404);
      }
      // Verify ownership for transfers between own accounts
      if (toAccount.user_id !== userId) {
        throw new AppError('Access denied to destination account', 403);
      }
    } else if (toAccountNumber) {
      // Transfer to another user's account using account number
      toAccount = await accountRepository.findByAccountNumber(toAccountNumber);
      if (!toAccount) {
        throw new AppError('Destination account not found', 404);
      }
      // Prevent transferring to the same account
      if (toAccount.id === fromAccountId) {
        throw new AppError('Cannot transfer to the same account', 400);
      }
    }

    // Verify accounts are active
    if (fromAccount.status !== 'active') {
      throw new AppError('Source account is not active', 400);
    }
    if (toAccount.status !== 'active') {
      throw new AppError('Destination account is not active', 400);
    }

    // Check sufficient balance
    const fromBalance = parseFloat(fromAccount.balance.toString());
    if (fromBalance < amount) {
      throw new AppError('Insufficient balance', 400);
    }

    // Check account limits if applicable
    if (fromAccount.limit) {
      const limit = parseFloat(fromAccount.limit.toString());
      if (fromBalance - amount < -limit) {
        throw new AppError('Transfer would exceed account limit', 400);
      }
    }

    // Execute transfer in a transaction
    const pool = require('../database/connection').pool;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update balances
      const newFromBalance = fromBalance - amount;
      const newToBalance = parseFloat(toAccount.balance.toString()) + amount;

      await client.query(
        'UPDATE accounts SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newFromBalance, fromAccountId]
      );
      await client.query(
        'UPDATE accounts SET balance = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [toAccount.id, newToBalance]
      );

      // Create transactions
      const today = new Date();
      const fromTransaction = await client.query(
        `INSERT INTO transactions (account_id, date, merchant, category, amount, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          fromAccountId,
          today,
          description || `Transfer to ${toAccount.account_number}`,
          'transfer',
          -amount,
          'completed',
        ]
      );

      const toTransaction = await client.query(
        `INSERT INTO transactions (account_id, date, merchant, category, amount, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          toAccount.id,
          today,
          description || `Transfer from ${fromAccount.account_number}`,
          'transfer',
          amount,
          'completed',
        ]
      );

      await client.query('COMMIT');

      // Fetch updated accounts
      const updatedFromAccount = await accountRepository.findById(fromAccountId);
      const updatedToAccount = await accountRepository.findById(toAccount.id);

      return {
        fromTransaction: fromTransaction.rows[0],
        toTransaction: toTransaction.rows[0],
        fromAccount: updatedFromAccount,
        toAccount: updatedToAccount,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new TransferService();

