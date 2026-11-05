import { Router } from 'express';
import { reviewController } from './review.controller.js';
import { requireAdmin } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', ...requireAdmin(), reviewController.listReviews.bind(reviewController));
router.patch('/:id/approve', ...requireAdmin(), reviewController.approveReview.bind(reviewController));
router.delete('/:id', ...requireAdmin(), reviewController.rejectReview.bind(reviewController));

export default router;
