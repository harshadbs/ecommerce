import { prisma } from '../../../config/database.js';
import { User, Prisma } from '@prisma/client';
import type { SafeUser } from '../../types/index.js';

// Fields to exclude from user responses
const safeUserSelect = {
  id: true,
  email: true,
  phone: true,
  name: true,
  role: true,
  isActive: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export class UserPersistence {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByIdSafe(id: string): Promise<SafeUser | null> {
    return prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findByEmailSafe(email: string): Promise<SafeUser | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: safeUserSelect,
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { phone },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<SafeUser> {
    return prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
      },
      select: safeUserSelect,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<SafeUser> {
    return prisma.user.update({
      where: { id },
      data,
      select: safeUserSelect,
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({ where });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<SafeUser[]> {
    return prisma.user.findMany({
      ...params,
      select: safeUserSelect,
    });
  }
}

export const userPersistence = new UserPersistence();
