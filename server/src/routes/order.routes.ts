import { Router } from 'express';
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  validatePromo,
} from '../controllers/order.controller';
import { optionalAuth, requireAuth, requireRole } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  validatePromoSchema,
} from '../schemas/order.schema';

export const orderRouter = Router();

orderRouter.post('/validate-promo', validateBody(validatePromoSchema), validatePromo);
orderRouter.post('/', optionalAuth, validateBody(createOrderSchema), createOrder);
orderRouter.get('/', requireAuth, requireRole('ADMIN', 'STAFF'), getOrders);
orderRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN', 'STAFF'),
  validateBody(updateOrderStatusSchema),
  updateOrderStatus
);
