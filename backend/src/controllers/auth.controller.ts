import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { sendSuccess, sendCreated, sendMessage } from '../utils/response.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  ChangePasswordInput,
} from '../validators/auth.validator.js';

export class AuthController {
  async register(
    req: Request<object, object, RegisterInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.register(req.body);
      sendCreated(res, result);
    } catch (error) {
      next(error);
    }
  }

  async login(
    req: Request<object, object, LoginInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(
    req: Request<object, object, RefreshTokenInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tokens = await authService.refresh(req.body.refreshToken);
      sendSuccess(res, { tokens });
    } catch (error) {
      next(error);
    }
  }

  async logout(
    req: Request<object, object, RefreshTokenInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await authService.logout(req.body.refreshToken);
      sendMessage(res, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }
      await authService.logoutAll(req.user.userId);
      sendMessage(res, 'Logged out from all devices');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(
    req: AuthenticatedRequest & { body: ChangePasswordInput },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }
      await authService.changePassword(req.user.userId, req.body);
      sendMessage(res, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
