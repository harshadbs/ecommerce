import { userPersistence } from '../../user/persistence/index.js';
import { refreshTokenPersistence } from '../persistence/index.js';
import { verifyPassword } from '../../../utils/password.js';
import { generateTokenPair } from '../../../utils/jwt.js';
import { UnauthorizedError, NotFoundError } from '../../../utils/errors.js';
import type { LoginInput } from '../auth.validator.js';
import type { TokenPair, JwtPayload, SafeUser } from '../../../types/index.js';

export interface LoginResult {
  user: SafeUser;
  tokens: TokenPair;
}

export class LoginUserUseCase {
  async execute(data: LoginInput): Promise<LoginResult> {
    // Find user
    const user = await userPersistence.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('errors.invalid_credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('errors.account_disabled');
    }

    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('errors.invalid_credentials');
    }

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokenPair(payload);

    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Return safe user (without password)
    const safeUser = await userPersistence.findByIdSafe(user.id);
    if (!safeUser) {
      throw new NotFoundError('errors.user_not_found');
    }

    return { user: safeUser, tokens };
  }

  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await refreshTokenPersistence.create({
      token,
      userId,
      expiresAt,
    });
  }
}

export const loginUserUseCase = new LoginUserUseCase();
