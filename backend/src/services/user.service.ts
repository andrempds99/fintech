import userRepository from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../auth/password';
import { CreateUserDto, UpdateUserDto, User } from '../types/user';
import { AppError } from '../middleware/error.middleware';

export class UserService {
  async register(userData: CreateUserDto): Promise<Omit<User, 'password_hash'>> {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(userData.password);

    // Create user
    const user = await userRepository.create({
      email: userData.email,
      passwordHash,
      name: userData.name,
      role: userData.role,
    });

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async authenticate(email: string, password: string): Promise<User> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.password_hash) {
      throw new AppError('Invalid user data', 500);
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    await userRepository.updateLastLogin(user.id);

    return user;
  }

  async getById(id: string): Promise<Omit<User, 'password_hash'>> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, updates: UpdateUserDto): Promise<Omit<User, 'password_hash'>> {
    const user = await userRepository.update(id, updates);
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAll(limit: number = 100, offset: number = 0) {
    const users = await userRepository.findAll(limit, offset);
    const total = await userRepository.count();

    return {
      users: users.map(({ password_hash, ...user }) => user),
      total,
      limit,
      offset,
    };
  }
}

export default new UserService();

