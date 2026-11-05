import { Response, NextFunction } from 'express';
import { sendSuccess, sendMessage, sendPaginated } from '../../utils/response.js';
import { NotFoundError } from '../../utils/errors.js';
import { parsePagination } from '../../utils/pagination.js';
import type { AuthenticatedRequest } from '../../types/index.js';
import { reviewPersistence } from './persistence/index.js';

export class ReviewController {
  async listReviews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, skip } = parsePagination(req.query as any);
      const { approved } = req.query as { approved?: string };
      const isApproved = approved === 'true' ? true : approved === 'false' ? false : undefined;
      const { reviews, total } = await reviewPersistence.findAll({ skip, limit, isApproved });
      sendPaginated(res, reviews, { page, limit, total });
    } catch (error) {
      next(error);
    }
  }

  async approveReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await reviewPersistence.findById(req.params.id);
      if (!existing) throw new NotFoundError('Review not found');
      const review = await reviewPersistence.approve(req.params.id);
      sendSuccess(res, { review });
    } catch (error) {
      next(error);
    }
  }

  async rejectReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await reviewPersistence.findById(req.params.id);
      if (!existing) throw new NotFoundError('Review not found');
      await reviewPersistence.reject(req.params.id);
      sendMessage(res, 'Review rejected and removed');
    } catch (error) {
      next(error);
    }
  }
}

export const reviewController = new ReviewController();
