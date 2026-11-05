import { prisma } from '../../../config/database.js';
import { Coupon, Prisma } from '@prisma/client';

export class CouponPersistence {
  async findById(id: string): Promise<Coupon | null> {
    return prisma.coupon.findUnique({ where: { id } });
  }

  async findByCode(code: string): Promise<Coupon | null> {
    return prisma.coupon.findUnique({ where: { code } });
  }

  async findAll(options: { skip: number; limit: number; search?: string }): Promise<{ coupons: Coupon[]; total: number }> {
    const where: Prisma.CouponWhereInput = {};
    if (options.search) {
      where.OR = [
        { code: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({ where, orderBy: { createdAt: 'desc' }, skip: options.skip, take: options.limit }),
      prisma.coupon.count({ where }),
    ]);

    return { coupons, total };
  }

  async create(data: Prisma.CouponCreateInput): Promise<Coupon> {
    return prisma.coupon.create({ data });
  }

  async update(id: string, data: Prisma.CouponUpdateInput): Promise<Coupon> {
    return prisma.coupon.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.coupon.delete({ where: { id } });
  }

  async codeExists(code: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.CouponWhereInput = { code };
    if (excludeId) where.id = { not: excludeId };
    return (await prisma.coupon.count({ where })) > 0;
  }
}

export const couponPersistence = new CouponPersistence();
