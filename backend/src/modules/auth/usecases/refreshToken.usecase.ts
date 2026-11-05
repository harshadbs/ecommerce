import { userPersistence } from '../../user/persistence/index.js';
import { refreshTokenPersistence } from '../persistence/index.js';
import { verifyRefreshToken, generateTokenPair } from '../../../utils/jwt.js';
import { UnauthorizedError } from '../../../utils/errors.js';
import type { TokenPair, JwtPayload } from '../../../types/index.js';

export class RefreshTokenUseCase {
  async execute(refreshToken: string): Promise<TokenPair> {
    // Verify refresh token
    let payload: JwtPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('errors.session_expired');
    }

    // Check if token exists in database
    const storedToken = await refreshTokenPersistence.findByToken(refreshToken);
    if (!storedToken) {
      throw new UnauthorizedError('errors.session_expired');
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await refreshTokenPersistence.deleteByToken(refreshToken);
      throw new UnauthorizedError('errors.session_expired');
    }

    // Get user
    const user = await userPersistence.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('errors.account_disabled');
    }

    // Delete old refresh token
    await refreshTokenPersistence.deleteByToken(refreshToken);

    // Generate new tokens
    const newPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokenPair(newPayload);

    // Store new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await refreshTokenPersistence.create({
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt,
    });

    return tokens;
  }
}

export const refreshTokenUseCase = new RefreshTokenUseCase();
