import { Response, NextFunction } from 'express';
import { sendSuccess, sendPaginated } from '../../utils/response.js';
import { NotFoundError } from '../../utils/errors.js';
import { parsePagination } from '../../utils/pagination.js';
import type { AuthenticatedRequest } from '../../types/index.js';
import { orderPersistence } from './persistence/index.js';
import { OrderStatus } from '@prisma/client';

export class OrderController {
  async listOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, skip } = parsePagination(req.query as any);
      const { search, status } = req.query as { search?: string; status?: string };

      const { orders, total } = await orderPersistence.search({
        search,
        status: status as OrderStatus | undefined,
        skip,
        limit,
      });

      sendPaginated(res, orders, { page, limit, total });
    } catch (error) {
      next(error);
    }
  }

  async getOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderPersistence.findById(req.params.id);
      if (!order) throw new NotFoundError('Order not found');
      sendSuccess(res, { order });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, note } = req.body;
      const existing = await orderPersistence.findById(req.params.id);
      if (!existing) throw new NotFoundError('Order not found');

      const order = await orderPersistence.updateStatus(
        req.params.id,
        status as OrderStatus,
        note,
        req.user?.userId
      );
      sendSuccess(res, { order });
    } catch (error) {
      next(error);
    }
  }

  async getStats(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await orderPersistence.getStats();
      sendSuccess(res, { stats });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
