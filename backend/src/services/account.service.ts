import accountRepository from '../repositories/account.repository';
import { CreateAccountDto, Account } from '../types/account';
import { AppError } from '../middleware/error.middleware';
import { v4 as uuidv4 } from 'uuid';

export class AccountService {
  async create(userId: string, accountData: CreateAccountDto): Promise<Account> {
    // Generate account number (last 4 digits)
    const accountNumber = `****${Math.floor(1000 + Math.random() * 9000)}`;

    const account = await accountRepository.create({
      userId,
      name: accountData.name,
      type: accountData.type,
      balance: 0,
      currency: accountData.currency || 'USD',
      accountNumber,
      limit: accountData.limit,
    });

    return account;
  }

  async getByUserId(userId: string): Promise<Account[]> {
    return accountRepository.findByUserId(userId);
  }

  async getById(id: string, userId?: string): Promise<Account> {
    const account = await accountRepository.findById(id);
    if (!account) {
      throw new AppError('Account not found', 404);
    }

    // If userId provided, verify ownership
    if (userId && account.user_id !== userId) {
      throw new AppError('Access denied', 403);
    }

    return account;
  }

  async updateBalance(id: string, newBalance: number): Promise<Account> {
    return accountRepository.updateBalance(id, newBalance);
  }

  async updateStatus(id: string, status: string): Promise<Account> {
    return accountRepository.updateStatus(id, status);
  }

  async getAll(limit: number = 100, offset: number = 0) {
    const accounts = await accountRepository.findAll(limit, offset);
    const total = await accountRepository.count();

    return {
      accounts,
      total,
      limit,
      offset,
    };
  }

  async getActiveAccountsForTransfers(userId: string) {
    // Return only the user's own active accounts for transfers
    const accounts = await accountRepository.findByUserId(userId);
    return accounts.filter(account => account.status === 'active');
  }

  async delete(id: string, userId: string): Promise<void> {
    const account = await accountRepository.findById(id);
    if (!account) {
      throw new AppError('Account not found', 404);
    }
    if (account.user_id !== userId) {
      throw new AppError('Access denied', 403);
    }
    if (parseFloat(account.balance.toString()) !== 0) {
      throw new AppError('Cannot delete account with non-zero balance', 400);
    }
    
    await accountRepository.delete(id, userId);
  }

  async setHighlight(id: string, userId: string, isHighlighted: boolean): Promise<Account> {
    const account = await accountRepository.findById(id);
    if (!account) {
      throw new AppError('Account not found', 404);
    }
    if (account.user_id !== userId) {
      throw new AppError('Access denied', 403);
    }
    
    return accountRepository.setHighlight(id, userId, isHighlighted);
  }

  async getHighlightedAccount(userId: string): Promise<Account | null> {
    return accountRepository.findHighlighted(userId);
  }
}

export default new AccountService();

