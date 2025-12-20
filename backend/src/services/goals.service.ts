import goalsRepository from '../repositories/goals.repository';
import { AppError } from '../middleware/error.middleware';

export interface CreateGoalDto {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  category: string;
  targetDate?: string;
}

export class GoalsService {
  async create(userId: string, goalData: CreateGoalDto) {
    return goalsRepository.create({
      userId,
      name: goalData.name,
      targetAmount: goalData.targetAmount,
      currentAmount: goalData.currentAmount,
      category: goalData.category,
      targetDate: goalData.targetDate ? new Date(goalData.targetDate) : undefined,
      status: 'active',
    });
  }

  async getByUserId(userId: string) {
    return goalsRepository.findByUserId(userId);
  }

  async getById(id: string, userId: string) {
    const goal = await goalsRepository.findById(id);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }
    if (goal.user_id !== userId) {
      throw new AppError('Access denied', 403);
    }
    return goal;
  }

  async update(id: string, userId: string, updates: {
    name?: string;
    targetAmount?: number;
    currentAmount?: number;
    category?: string;
    targetDate?: string;
    status?: string;
  }) {
    const goal = await goalsRepository.findById(id);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }
    if (goal.user_id !== userId) {
      throw new AppError('Access denied', 403);
    }

    return goalsRepository.update(id, {
      name: updates.name,
      targetAmount: updates.targetAmount,
      currentAmount: updates.currentAmount,
      category: updates.category,
      targetDate: updates.targetDate ? new Date(updates.targetDate) : undefined,
      status: updates.status,
    });
  }

  async updateProgress(id: string, userId: string, amount: number) {
    const goal = await goalsRepository.findById(id);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }
    if (goal.user_id !== userId) {
      throw new AppError('Access denied', 403);
    }

    const newCurrentAmount = parseFloat(goal.current_amount.toString()) + amount;
    const targetAmount = parseFloat(goal.target_amount.toString());
    
    let status = goal.status;
    if (newCurrentAmount >= targetAmount && status === 'active') {
      status = 'completed';
    }

    return goalsRepository.update(id, {
      currentAmount: newCurrentAmount,
      status,
    });
  }

  async delete(id: string, userId: string) {
    const goal = await goalsRepository.findById(id);
    if (!goal) {
      throw new AppError('Goal not found', 404);
    }
    if (goal.user_id !== userId) {
      throw new AppError('Access denied', 403);
    }
    await goalsRepository.delete(id);
  }
}

export default new GoalsService();

