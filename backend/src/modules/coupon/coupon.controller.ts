import { Response, NextFunction } from 'express';
import { sendSuccess, sendCreated, sendMessage, sendPaginated } from '../../utils/response.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import { parsePagination } from '../../utils/pagination.js';
import type { AuthenticatedRequest } from '../../types/index.js';
import { couponPersistence } from './persistence/index.js';

export class CouponController {
  async listCoupons(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, skip } = parsePagination(req.query as any);
      const { search } = req.query as { search?: string };
      const { coupons, total } = await couponPersistence.findAll({ skip, limit, search });
      sendPaginated(res, coupons, { page, limit, total });
    } catch (error) {
      next(error);
    }
  }

  async getCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await couponPersistence.findById(req.params.id);
      if (!coupon) throw new NotFoundError('Coupon not found');
      sendSuccess(res, { coupon });
    } catch (error) {
      next(error);
    }
  }

  async createCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, ...data } = req.body;
      const upperCode = code.toUpperCase();

      if (await couponPersistence.codeExists(upperCode)) {
        throw new ConflictError('Coupon code already exists');
      }

      const coupon = await couponPersistence.create({ ...data, code: upperCode });
      sendCreated(res, { coupon });
    } catch (error) {
      next(error);
    }
  }

  async updateCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await couponPersistence.findById(req.params.id);
      if (!existing) throw new NotFoundError('Coupon not found');

      if (req.body.code) {
        const upperCode = req.body.code.toUpperCase();
        if (await couponPersistence.codeExists(upperCode, req.params.id)) {
          throw new ConflictError('Coupon code already exists');
        }
        req.body.code = upperCode;
      }

      const coupon = await couponPersistence.update(req.params.id, req.body);
      sendSuccess(res, { coupon });
    } catch (error) {
      next(error);
    }
  }

  async deleteCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await couponPersistence.findById(req.params.id);
      if (!existing) throw new NotFoundError('Coupon not found');
      await couponPersistence.delete(req.params.id);
      sendMessage(res, 'Coupon deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const couponController = new CouponController();
