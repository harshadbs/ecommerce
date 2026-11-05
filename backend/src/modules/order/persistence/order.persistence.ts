import { prisma } from '../../../config/database.js';
import { Order, OrderStatus, Prisma } from '@prisma/client';

export interface OrderSearchOptions {
  userId?: string;
  status?: OrderStatus;
  search?: string;
  skip: number;
  limit: number;
}

const orderIncludes = {
  user: { select: { id: true, name: true, email: true, phone: true } },
  address: true,
  items: {
    include: {
      product: { select: { id: true, name: true, slug: true } },
      variant: { select: { id: true, name: true } },
    },
  },
  payment: true,
  statusHistory: { orderBy: { createdAt: 'desc' as const } },
};

export class OrderPersistence {
  async findById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({ where: { id }, include: orderIncludes });
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return prisma.order.findUnique({ where: { orderNumber }, include: orderIncludes });
  }

  async search(options: OrderSearchOptions): Promise<{ orders: Order[]; total: number }> {
    const where: Prisma.OrderWhereInput = {};

    if (options.userId) where.userId = options.userId;
    if (options.status) where.orderStatus = options.status;
    if (options.search) {
      where.OR = [
        { orderNumber: { contains: options.search, mode: 'insensitive' } },
        { user: { name: { contains: options.search, mode: 'insensitive' } } },
        { user: { email: { contains: options.search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderIncludes,
        orderBy: { createdAt: 'desc' },
        skip: options.skip,
        take: options.limit,
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  async updateStatus(id: string, status: OrderStatus, note?: string, createdBy?: string): Promise<Order> {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: { orderStatus: status },
        include: orderIncludes,
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          note,
          createdBy,
        },
      });

      return order;
    });
  }

  async getStats(): Promise<{ total: number; pending: number; processing: number; delivered: number; revenue: number }> {
    const [total, pending, processing, delivered, revenueResult] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: 'PENDING' } }),
      prisma.order.count({ where: { orderStatus: { in: ['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED'] } } }),
      prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
    ]);

    return { total, pending, processing, delivered, revenue: Number(revenueResult._sum.total || 0) };
  }
}

export const orderPersistence = new OrderPersistence();
