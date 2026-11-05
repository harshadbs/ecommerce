import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendCreated, sendMessage } from '../../utils/response.js';
import type { AuthenticatedRequest } from '../../types/index.js';
import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  ChangePasswordInput,
} from './auth.validator.js';
import { registerUserUseCase } from './usecases/registerUser.usecase.js';
import { loginUserUseCase } from './usecases/loginUser.usecase.js';
import { refreshTokenUseCase } from './usecases/refreshToken.usecase.js';
import { logoutUserUseCase, logoutAllUseCase } from './usecases/logoutUser.usecase.js';
import { changePasswordUseCase } from './usecases/changePassword.usecase.js';

export class AuthController {
  async register(
    req: Request<object, object, RegisterInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await registerUserUseCase.execute(req.body);
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
      const result = await loginUserUseCase.execute(req.body);
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
      const tokens = await refreshTokenUseCase.execute(req.body.refreshToken);
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
      await logoutUserUseCase.execute(req.body.refreshToken);
      sendMessage(res, 'messages.logout_success');
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
      await logoutAllUseCase.execute(req.user.userId);
      sendMessage(res, 'messages.logout_success');
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
      await changePasswordUseCase.execute(req.user.userId, req.body);
      sendMessage(res, 'messages.password_changed');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
