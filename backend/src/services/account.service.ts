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
}

export default new AccountService();

