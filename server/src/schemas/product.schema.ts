import { z } from 'zod';

export const productCategoryEnum = z.enum([
  'Laptops',
  'Smartphones',
  'Tablets',
  'Gaming',
  'Audio',
]);

export const createProductSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(3, 'SKU must be at least 3 characters')
    .max(32)
    .transform((val) => val.toUpperCase()),
  name: z.string().trim().min(3, 'Product name is required').max(140),
  brand: z.string().trim().min(2, 'Brand is required').max(60),
  category: productCategoryEnum,
  price: z.number().positive('Price must be greater than $0'),
  stock: z.number().int().min(0, 'Initial stock cannot be negative').max(500),
  warrantyMonths: z.number().int().min(1).max(60).default(12),
  visible: z.boolean().default(true),
  featured: z.boolean().default(false),
  specProcessor: z.string().trim().min(2, 'Processor / chipset spec is required').max(160),
  specMemory: z.string().trim().min(2, 'Memory / storage spec is required').max(160),
  specDisplay: z.string().trim().min(2, 'Display / driver / output spec is required').max(160),
  imageUrl: z.string().trim().url('Valid image URL is required'),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(3).max(140).optional(),
  brand: z.string().trim().min(2).max(60).optional(),
  category: productCategoryEnum.optional(),
  price: z.number().positive('Price must be greater than $0').optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative').max(1000).optional(),
  warrantyMonths: z.number().int().min(1).max(60).optional(),
  visible: z.boolean().optional(),
  featured: z.boolean().optional(),
  specProcessor: z.string().trim().min(2).max(160).optional(),
  specMemory: z.string().trim().min(2).max(160).optional(),
  specDisplay: z.string().trim().min(2).max(160).optional(),
  imageUrl: z.string().trim().url().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
