import { z } from 'zod';

export const validatePromoSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Promo code is required')
    .transform((val) => val.toUpperCase()),
  subtotal: z.number().nonnegative('Subtotal must be 0 or greater'),
});

export const orderItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(50),
});

export const createOrderSchema = z.object({
  channel: z.enum(['STOREFRONT', 'POS']).default('STOREFRONT'),
  customerName: z.string().trim().min(2, 'Customer name is required').max(100),
  customerEmail: z.string().trim().email('Valid customer email is required').toLowerCase(),
  shippingAddress: z.string().trim().min(3, 'Address or In-Store Pickup note is required').max(300),
  paymentMethod: z.string().trim().min(2, 'Payment method is required').max(60),
  promoCode: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val && val.length > 0 ? val.toUpperCase() : undefined)),
  items: z.array(orderItemInputSchema).min(1, 'At least one item is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PACKED', 'SHIPPED', 'COMPLETED']),
});

export type ValidatePromoInput = z.infer<typeof validatePromoSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
