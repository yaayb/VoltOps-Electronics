import { z } from 'zod';

export const rmaStatusEnum = z.enum([
  'RECEIVED',
  'DIAGNOSING',
  'REPAIRING',
  'RESOLVED',
]);

export const createRmaSchema = z.object({
  serial: z
    .string()
    .trim()
    .min(3, 'Serial / IMEI number is required')
    .transform((val) => val.toUpperCase()),
  customerName: z.string().trim().min(2, 'Customer name is required').max(100),
  issueDescription: z
    .string()
    .trim()
    .min(5, 'Issue description must be at least 5 characters')
    .max(1000),
  technicianNotes: z.string().trim().max(1000).optional().default(''),
});

export const updateRmaStatusSchema = z.object({
  status: rmaStatusEnum,
  technicianNotes: z.string().trim().max(1000).optional(),
});

export const promoCodeInputSchema = z.object({
  id: z.string().optional(),
  code: z
    .string()
    .trim()
    .min(2, 'Promo code must be at least 2 characters')
    .max(24)
    .transform((val) => val.toUpperCase()),
  type: z.enum(['PERCENT', 'FIXED']),
  value: z.number().positive('Discount value must be positive'),
  minSpend: z.number().nonnegative('Minimum spend cannot be negative'),
  active: z.boolean().default(true),
});

export const updateSettingsSchema = z.object({
  storeName: z.string().trim().min(2, 'Store name is required').max(100),
  freeShippingThreshold: z.number().nonnegative(),
  lowStockThreshold: z.number().int().min(0).max(100),
  taxRatePercent: z.number().min(0).max(50),
  promoCodes: z.array(promoCodeInputSchema).optional(),
});

export type CreateRmaInput = z.infer<typeof createRmaSchema>;
export type UpdateRmaStatusInput = z.infer<typeof updateRmaStatusSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
