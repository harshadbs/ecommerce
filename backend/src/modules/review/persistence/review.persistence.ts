import { prisma } from '../../../config/database.js';
import { Review, Prisma } from '@prisma/client';

export class ReviewPersistence {
  async findAll(options: { skip: number; limit: number; isApproved?: boolean }): Promise<{ reviews: Review[]; total: number }> {
    const where: Prisma.ReviewWhereInput = {};
    if (options.isApproved !== undefined) where.isApproved = options.isApproved;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: options.skip,
        take: options.limit,
      }),
      prisma.review.count({ where }),
    ]);

    return { reviews, total };
  }

  async approve(id: string): Promise<Review> {
    return prisma.review.update({ where: { id }, data: { isApproved: true } });
  }

  async reject(id: string): Promise<void> {
    await prisma.review.delete({ where: { id } });
  }

  async findById(id: string): Promise<Review | null> {
    return prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
    });
  }
}

export const reviewPersistence = new ReviewPersistence();
