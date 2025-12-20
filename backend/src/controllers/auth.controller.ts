import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../auth/jwt';
import { AppError } from '../middleware/error.middleware';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name, role } = req.body;

      const user = await userService.register({
        email,
        password,
        name,
        role,
      });

      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      res.status(201).json({
        user,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await userService.authenticate(email, password);

      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      const { password_hash, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token required', 400);
      }

      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Generate new tokens
      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };

      const newAccessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // In a real application, this would send a password reset email
      // For now, we'll just return a success message
      const { email } = req.body;

      // Check if user exists (but don't reveal if they don't for security)
      res.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, newPassword, resetToken } = req.body;

      if (!email || !newPassword || !resetToken) {
        throw new AppError('Email, new password, and reset token are required', 400);
      }

      // Note: In a production application, this would:
      // 1. Verify the reset token (check expiration, validity)
      // 2. Find the user by email
      // 3. Update the password
      // 4. Invalidate the reset token
      // For now, we return a success message for API compatibility
      // The actual implementation would require a password reset token system
      
      res.json({
        message: 'Password reset functionality requires token verification system',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();

