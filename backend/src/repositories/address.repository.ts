import { prisma } from '../config/database.js';
import { Address, Prisma } from '@prisma/client';

export class AddressRepository {
  async findById(id: string): Promise<Address | null> {
    return prisma.address.findUnique({
      where: { id },
    });
  }

  async findByIdAndUser(id: string, userId: string): Promise<Address | null> {
    return prisma.address.findFirst({
      where: { id, userId },
    });
  }

  async findByUser(userId: string): Promise<Address[]> {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findDefaultByUser(userId: string): Promise<Address | null> {
    return prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
  }

  async create(data: Prisma.AddressCreateInput): Promise<Address> {
    // If this is set as default, unset other defaults first
    if (data.isDefault && data.user && typeof data.user === 'object' && 'connect' in data.user) {
      await this.clearDefaultForUser(data.user.connect?.id as string);
    }

    return prisma.address.create({ data });
  }

  async update(id: string, data: Prisma.AddressUpdateInput): Promise<Address> {
    return prisma.address.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.address.delete({
      where: { id },
    });
  }

  async setDefault(id: string, userId: string): Promise<Address> {
    // Clear existing default
    await this.clearDefaultForUser(userId);

    // Set new default
    return prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  async clearDefaultForUser(userId: string): Promise<void> {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  async countByUser(userId: string): Promise<number> {
    return prisma.address.count({
      where: { userId },
    });
  }
}

export const addressRepository = new AddressRepository();
