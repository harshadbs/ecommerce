import { Router } from 'express';
import { orderController } from './order.controller.js';
import { requireAdmin } from '../../middleware/auth.middleware.js';

const router = Router();

// All order admin routes require admin
router.get('/stats', ...requireAdmin(), orderController.getStats.bind(orderController));
router.get('/', ...requireAdmin(), orderController.listOrders.bind(orderController));
router.get('/:id', ...requireAdmin(), orderController.getOrder.bind(orderController));
router.patch('/:id/status', ...requireAdmin(), orderController.updateStatus.bind(orderController));

export default router;
