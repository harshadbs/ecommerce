import { Router } from 'express';
import { couponController } from './coupon.controller.js';
import { requireAdmin } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', ...requireAdmin(), couponController.listCoupons.bind(couponController));
router.get('/:id', ...requireAdmin(), couponController.getCoupon.bind(couponController));
router.post('/', ...requireAdmin(), couponController.createCoupon.bind(couponController));
router.patch('/:id', ...requireAdmin(), couponController.updateCoupon.bind(couponController));
router.delete('/:id', ...requireAdmin(), couponController.deleteCoupon.bind(couponController));

export default router;
