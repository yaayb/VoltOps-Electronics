import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { CreateProductInput, UpdateProductInput } from '../schemas/product.schema';

function buildSerialPrefix(sku: string): string {
  const cleaned = sku.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 7);
  return `SN-${cleaned || 'VOLT'}`;
}

function extractSerialNumberSuffix(serial: string): number {
  const parts = serial.split('-');
  const last = parts[parts.length - 1];
  const parsed = Number.parseInt(last || '', 10);
  return Number.isNaN(parsed) ? 1000 : parsed;
}

export const getProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const stockStatus = typeof req.query.stockStatus === 'string' ? req.query.stockStatus.trim() : '';
  const visibleOnly = req.query.visibleOnly === 'true';
  const sort = typeof req.query.sort === 'string' ? req.query.sort.trim() : 'featured';

  const settings = await prisma.storeSetting.findUnique({ where: { id: 'singleton' } });
  const lowStockThreshold = settings?.lowStockThreshold ?? 3;

  const where: Prisma.ProductWhereInput = {};

  if (visibleOnly) {
    where.visible = true;
  }

  if (category && category !== 'ALL') {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
      { brand: { contains: search } },
      { specProcessor: { contains: search } },
      { specMemory: { contains: search } },
      { specDisplay: { contains: search } },
    ];
  }

  if (stockStatus === 'IN_STOCK') {
    where.stock = { gt: 0 };
  } else if (stockStatus === 'LOW_STOCK') {
    where.stock = { gt: 0, lte: lowStockThreshold };
  } else if (stockStatus === 'OUT_OF_STOCK') {
    where.stock = { equals: 0 };
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput[] = [
    { featured: 'desc' },
    { createdAt: 'asc' },
  ];

  if (sort === 'price_asc') {
    orderBy = [{ price: 'asc' }];
  } else if (sort === 'price_desc') {
    orderBy = [{ price: 'desc' }];
  } else if (sort === 'stock_asc') {
    orderBy = [{ stock: 'asc' }];
  } else if (sort === 'newest') {
    orderBy = [{ createdAt: 'desc' }];
  }

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      serialUnits: {
        where: { status: 'IN_STOCK' },
        select: { id: true, serial: true, status: true },
        orderBy: { serial: 'asc' },
      },
    },
  });

  res.json({ products });
});

export const createProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const input = req.body as CreateProductInput;

  const existingSku = await prisma.product.findUnique({ where: { sku: input.sku } });
  if (existingSku) {
    throw new AppError(`SKU "${input.sku}" already exists in catalog.`, 409, 'DUPLICATE_SKU');
  }

  const created = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        sku: input.sku,
        name: input.name,
        brand: input.brand,
        category: input.category,
        price: input.price,
        stock: input.stock,
        warrantyMonths: input.warrantyMonths,
        visible: input.visible,
        featured: input.featured,
        specProcessor: input.specProcessor,
        specMemory: input.specMemory,
        specDisplay: input.specDisplay,
        imageUrl: input.imageUrl,
      },
    });

    if (input.stock > 0) {
      const prefix = buildSerialPrefix(input.sku);
      const existingPrefixSerials = await tx.serialUnit.findMany({
        where: { serial: { startsWith: `${prefix}-` } },
        select: { serial: true },
      });

      let maxSuffix = 1000;
      for (const s of existingPrefixSerials) {
        const suffix = extractSerialNumberSuffix(s.serial);
        if (suffix > maxSuffix) {
          maxSuffix = suffix;
        }
      }

      const serialRows = Array.from({ length: input.stock }, (_, idx) => ({
        serial: `${prefix}-${maxSuffix + 1 + idx}`,
        productId: product.id,
        status: 'IN_STOCK',
      }));

      await tx.serialUnit.createMany({ data: serialRows });
    }

    return tx.product.findUniqueOrThrow({
      where: { id: product.id },
      include: {
        serialUnits: {
          where: { status: 'IN_STOCK' },
          select: { id: true, serial: true, status: true },
          orderBy: { serial: 'asc' },
        },
      },
    });
  });

  res.status(201).json({ product: created });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const productId = req.params.id;
  if (!productId) {
    throw new AppError('Product ID is required.', 400);
  }

  const input = req.body as UpdateProductInput;

  const updated = await prisma.$transaction(async (tx) => {
    const current = await tx.product.findUnique({
      where: { id: productId },
      include: {
        serialUnits: {
          orderBy: { serial: 'asc' },
        },
      },
    });

    if (!current) {
      throw new AppError('Product SKU not found.', 404, 'NOT_FOUND');
    }

    const inStockUnits = current.serialUnits.filter((u) => u.status === 'IN_STOCK');
    let nextStock = current.stock;

    if (typeof input.stock === 'number' && input.stock !== inStockUnits.length) {
      const delta = input.stock - inStockUnits.length;

      if (delta > 0) {
        const prefix = buildSerialPrefix(current.sku);
        const allMatchingPrefix = await tx.serialUnit.findMany({
          where: { serial: { startsWith: `${prefix}-` } },
          select: { serial: true },
        });

        let maxSuffix = 1000;
        for (const u of [...current.serialUnits, ...allMatchingPrefix]) {
          const suffix = extractSerialNumberSuffix(u.serial);
          if (suffix > maxSuffix) {
            maxSuffix = suffix;
          }
        }

        const newSerialRows = Array.from({ length: delta }, (_, idx) => ({
          serial: `${prefix}-${maxSuffix + 1 + idx}`,
          productId: current.id,
          status: 'IN_STOCK',
        }));

        await tx.serialUnit.createMany({ data: newSerialRows });
      } else if (delta < 0) {
        const removeCount = Math.abs(delta);
        if (inStockUnits.length < removeCount) {
          throw new AppError(
            `Cannot reduce stock by ${removeCount}. Only ${inStockUnits.length} IN_STOCK units available to retire.`,
            400,
            'INSUFFICIENT_IN_STOCK_UNITS'
          );
        }

        const unitsToRetire = inStockUnits.slice(-removeCount);
        await tx.serialUnit.deleteMany({
          where: {
            id: { in: unitsToRetire.map((u) => u.id) },
            status: 'IN_STOCK',
          },
        });
      }

      nextStock = input.stock;
    }

    return tx.product.update({
      where: { id: current.id },
      data: {
        name: input.name ?? current.name,
        brand: input.brand ?? current.brand,
        category: input.category ?? current.category,
        price: input.price ?? current.price,
        stock: nextStock,
        warrantyMonths: input.warrantyMonths ?? current.warrantyMonths,
        visible: input.visible ?? current.visible,
        featured: input.featured ?? current.featured,
        specProcessor: input.specProcessor ?? current.specProcessor,
        specMemory: input.specMemory ?? current.specMemory,
        specDisplay: input.specDisplay ?? current.specDisplay,
        imageUrl: input.imageUrl ?? current.imageUrl,
      },
      include: {
        serialUnits: {
          where: { status: 'IN_STOCK' },
          select: { id: true, serial: true, status: true },
          orderBy: { serial: 'asc' },
        },
      },
    });
  });

  res.json({ product: updated });
});
