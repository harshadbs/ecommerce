import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { sendSuccess, sendMessage } from '../utils/response.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { UpdateProfileInput } from '../validators/user.validator.js';

export class UserController {
  async getProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }
      const user = await userService.getProfile(req.user.userId);
      sendSuccess(res, { user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(
    req: AuthenticatedRequest & { body: UpdateProfileInput },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }
      const user = await userService.updateProfile(req.user.userId, req.body);
      sendSuccess(res, { user });
    } catch (error) {
      next(error);
    }
  }

  async deactivateAccount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }
      await userService.deactivateAccount(req.user.userId);
      sendMessage(res, 'Account deactivated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
