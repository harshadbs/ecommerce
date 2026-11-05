import { UserRole } from '@prisma/client';
import { userPersistence } from '../../user/persistence/index.js';
import { refreshTokenPersistence } from '../persistence/index.js';
import { hashPassword } from '../../../utils/password.js';
import { generateTokenPair } from '../../../utils/jwt.js';
import { ConflictError } from '../../../utils/errors.js';
import type { RegisterInput } from '../auth.validator.js';
import type { TokenPair, JwtPayload, SafeUser } from '../../../types/index.js';

export interface RegisterResult {
  user: SafeUser;
  tokens: TokenPair;
}

export class RegisterUserUseCase {
  async execute(data: RegisterInput): Promise<RegisterResult> {
    // Check if user already exists
    const existingUser = await userPersistence.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('errors.email_exists');
    }

    // Check phone if provided
    if (data.phone) {
      const existingPhone = await userPersistence.findByPhone(data.phone);
      if (existingPhone) {
        throw new ConflictError('errors.phone_exists');
      }
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await userPersistence.create({
      email: data.email,
      name: data.name,
      passwordHash,
      phone: data.phone,
      role: UserRole.CUSTOMER,
    });

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokenPair(payload);

    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens };
  }

  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await refreshTokenPersistence.create({
      token,
      userId,
      expiresAt,
    });
  }
}

export const registerUserUseCase = new RegisterUserUseCase();
