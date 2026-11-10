import { Router } from 'express';
import { createProduct, getProducts, updateProduct } from '../controllers/product.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema';

export const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  validateBody(createProductSchema),
  createProduct
);
productRouter.patch(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'STAFF'),
  validateBody(updateProductSchema),
  updateProduct
);
