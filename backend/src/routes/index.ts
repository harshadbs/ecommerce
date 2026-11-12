import { Router } from 'express';
import { authRouter } from '../modules/auth/index.js';
import { userRouter } from '../modules/user/index.js';
import { addressRouter } from '../modules/address/index.js';
import { categoryRouter } from '../modules/category/index.js';
import { productRouter, productController, productPersistence } from '../modules/product/index.js';
import { orderRouter } from '../modules/order/index.js';
import { couponRouter } from '../modules/coupon/index.js';
import { reviewRouter } from '../modules/review/index.js';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { userPersistence } from '../modules/user/index.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { parsePagination } from '../utils/pagination.js';
import { NotFoundError } from '../utils/errors.js';
import { orderPersistence } from '../modules/order/index.js';
import type { AuthenticatedRequest } from '../types/index.js';
import { Response, NextFunction } from 'express';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/addresses', addressRouter);
router.use('/categories', categoryRouter);
router.use('/products', productRouter);
router.use('/orders', orderRouter);
router.use('/coupons', couponRouter);
router.use('/reviews', reviewRouter);

// Admin-specific routes
router.get(
  '/admin/products',
  ...requireAdmin(),
  productController.adminListProducts.bind(productController)
);

// Admin: Customers management
router.get('/admin/customers', ...requireAdmin(), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as any);
    const { search, active } = req.query as { search?: string; active?: string };

    const where: any = { role: 'CUSTOMER' };
    if (active === 'true') where.isActive = true;
    if (active === 'false') where.isActive = false;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [customers, total] = await Promise.all([
      userPersistence.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      userPersistence.count(where),
    ]);

    sendPaginated(res, customers, { page, limit, total });
  } catch (error) {
    next(error);
  }
});

router.get('/admin/customers/:id', ...requireAdmin(), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userPersistence.findByIdSafe(req.params.id);
    if (!user) throw new NotFoundError('Customer not found');
    sendSuccess(res, { customer: user });
  } catch (error) {
    next(error);
  }
});

router.patch('/admin/customers/:id/toggle-active', ...requireAdmin(), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userPersistence.findByIdSafe(req.params.id);
    if (!user) throw new NotFoundError('Customer not found');
    const updated = await userPersistence.update(req.params.id, { isActive: !user.isActive });
    sendSuccess(res, { customer: updated });
  } catch (error) {
    next(error);
  }
});

// Admin: Dashboard stats
const TREND_DAYS = 30;

// Percentage change between two periods; null when there is no earlier figure to compare with.
const percentChange = (current: number, previous: number): number | null =>
  previous > 0 ? Math.round(((current - previous) / previous) * 1000) / 10 : null;

router.get('/admin/stats', ...requireAdmin(), async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const periodStart = new Date(now.getTime() - TREND_DAYS * 24 * 60 * 60 * 1000);
    const previousStart = new Date(now.getTime() - 2 * TREND_DAYS * 24 * 60 * 60 * 1000);

    const [orderStats, totalCustomers, lowStock, current, previous, newCustomers, previousNewCustomers] =
      await Promise.all([
        orderPersistence.getStats(),
        userPersistence.count({ role: 'CUSTOMER' }),
        productPersistence.countLowStock(),
        orderPersistence.getPeriodStats(periodStart, now),
        orderPersistence.getPeriodStats(previousStart, periodStart),
        userPersistence.count({ role: 'CUSTOMER', createdAt: { gte: periodStart, lt: now } }),
        userPersistence.count({ role: 'CUSTOMER', createdAt: { gte: previousStart, lt: periodStart } }),
      ]);

    sendSuccess(res, {
      stats: {
        ...orderStats,
        totalCustomers,
        lowStock,
        // Last 30 days compared with the 30 days before that
        trends: {
          days: TREND_DAYS,
          revenue: percentChange(current.revenue, previous.revenue),
          orders: percentChange(current.orders, previous.orders),
          customers: percentChange(newCustomers, previousNewCustomers),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
