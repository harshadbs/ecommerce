import { Response, NextFunction } from 'express';
import { sendSuccess, sendMessage } from '../../utils/response.js';
import type { AuthenticatedRequest } from '../../types/index.js';
import type { UpdateProfileInput } from './user.validator.js';
import { getUserProfileUseCase } from './usecases/getUserProfile.usecase.js';
import { updateUserProfileUseCase } from './usecases/updateUserProfile.usecase.js';
import { deactivateUserUseCase } from './usecases/deactivateUser.usecase.js';

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
      const user = await getUserProfileUseCase.execute(req.user.userId);
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
      const user = await updateUserProfileUseCase.execute(req.user.userId, req.body);
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
      await deactivateUserUseCase.execute(req.user.userId);
      sendMessage(res, 'Account deactivated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
