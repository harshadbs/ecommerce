import { prisma } from '../../../config/database.js';
import { RefreshToken } from '@prisma/client';

export class RefreshTokenPersistence {
  async create(data: { token: string; userId: string; expiresAt: Date }): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data,
    });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async deleteByToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return result.count;
  }
}

export const refreshTokenPersistence = new RefreshTokenPersistence();
