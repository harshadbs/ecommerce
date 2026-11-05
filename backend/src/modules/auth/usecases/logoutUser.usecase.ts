import { refreshTokenPersistence } from '../persistence/index.js';

export class LogoutUserUseCase {
  async execute(refreshToken: string): Promise<void> {
    await refreshTokenPersistence.deleteByToken(refreshToken);
  }
}

export class LogoutAllUseCase {
  async execute(userId: string): Promise<void> {
    await refreshTokenPersistence.deleteByUserId(userId);
  }
}

export const logoutUserUseCase = new LogoutUserUseCase();
export const logoutAllUseCase = new LogoutAllUseCase();
