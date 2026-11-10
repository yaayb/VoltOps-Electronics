import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import {
  CreateOrderInput,
  UpdateOrderStatusInput,
  ValidatePromoInput,
} from '../schemas/order.schema';

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function generateOrderNumber(channel: 'STOREFRONT' | 'POS'): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const prefix = channel === 'POS' ? 'POS' : 'VO';
  return `${prefix}-${y}${m}${d}-${rand}`;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  result.setMonth(result.getMonth() + months);
  return result;
}

function safeParseSerials(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((v): v is string => typeof v === 'string');
    }
    return [];
  } catch {
    return [];
  }
}

export const validatePromo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { code, subtotal } = req.body as ValidatePromoInput;

  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!promo || !promo.active) {
    throw new AppError(`Promo code "${code}" is invalid or inactive.`, 404, 'INVALID_PROMO');
  }

  if (subtotal < promo.minSpend) {
    throw new AppError(
      `Promo "${promo.code}" requires a minimum subtotal of $${promo.minSpend.toFixed(2)}.`,
      400,
      'MIN_SPEND_NOT_MET'
    );
  }

  const rawDiscount =
    promo.type === 'PERCENT' ? subtotal * (promo.value / 100) : promo.value;
  const discount = roundCurrency(Math.min(subtotal, rawDiscount));

  res.json({
    valid: true,
    promo: {
      id: promo.id,
      code: promo.code,
      type: promo.type,
      value: promo.value,
      minSpend: promo.minSpend,
    },
    discount,
  });
});

export const createOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const input = req.body as CreateOrderInput;

  if (input.channel === 'POS') {
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'STAFF')) {
      throw new AppError(
        'Authorized Admin or Staff session required for Walk-In POS register transactions.',
        403,
        'POS_FORBIDDEN'
      );
    }
  }

  // Merge duplicate productIds if present
  const consolidatedMap = new Map<string, number>();
  for (const item of input.items) {
    consolidatedMap.set(item.productId, (consolidatedMap.get(item.productId) ?? 0) + item.quantity);
  }

  const consolidatedItems = Array.from(consolidatedMap.entries()).map(
    ([productId, quantity]) => ({ productId, quantity })
  );

  const createdOrder = await prisma.$transaction(async (tx) => {
    const settings = await tx.storeSetting.findUnique({ where: { id: 'singleton' } });
    const freeShippingThreshold = settings?.freeShippingThreshold ?? 500;
    const taxRatePercent = settings?.taxRatePercent ?? 0;

    interface PreparedLineItem {
      productId: string;
      sku: string;
      productName: string;
      unitPrice: number;
      quantity: number;
      warrantyMonths: number;
      serialUnitIds: string[];
      serialStrings: string[];
    }

    const preparedItems: PreparedLineItem[] = [];
    let subtotal = 0;

    for (const reqItem of consolidatedItems) {
      const product = await tx.product.findUnique({
        where: { id: reqItem.productId },
      });

      if (!product) {
        throw new AppError('One or more selected products no longer exist.', 404, 'PRODUCT_NOT_FOUND');
      }

      if (input.channel === 'STOREFRONT' && !product.visible) {
        throw new AppError(`"${product.name}" is currently unavailable for online purchase.`, 400);
      }

      if (product.stock < reqItem.quantity) {
        throw new AppError(
          `Insufficient stock for "${product.name}". Requested ${reqItem.quantity}, available ${product.stock}.`,
          409,
          'INSUFFICIENT_STOCK'
        );
      }

      const availableSerials = await tx.serialUnit.findMany({
        where: {
          productId: product.id,
          status: 'IN_STOCK',
        },
        orderBy: { serial: 'asc' },
        take: reqItem.quantity,
      });

      if (availableSerials.length < reqItem.quantity) {
        throw new AppError(
          `Unable to allocate ${reqItem.quantity} serialized hardware unit(s) for "${product.name}". Only ${availableSerials.length} IN_STOCK serials available.`,
          409,
          'SERIAL_ALLOCATION_FAILED'
        );
      }

      subtotal = roundCurrency(subtotal + product.price * reqItem.quantity);

      preparedItems.push({
        productId: product.id,
        sku: product.sku,
        productName: product.name,
        unitPrice: product.price,
        quantity: reqItem.quantity,
        warrantyMonths: product.warrantyMonths,
        serialUnitIds: availableSerials.map((s) => s.id),
        serialStrings: availableSerials.map((s) => s.serial),
      });
    }

    let discount = 0;
    let appliedPromoCode: string | null = null;

    if (input.promoCode) {
      const promo = await tx.promoCode.findUnique({
        where: { code: input.promoCode.toUpperCase() },
      });

      if (!promo || !promo.active) {
        throw new AppError(`Promo code "${input.promoCode}" is invalid or inactive.`, 400, 'INVALID_PROMO');
      }

      if (subtotal < promo.minSpend) {
        throw new AppError(
          `Promo "${promo.code}" requires a minimum spend of $${promo.minSpend.toFixed(2)}.`,
          400,
          'MIN_SPEND_NOT_MET'
        );
      }

      const rawDiscount =
        promo.type === 'PERCENT' ? subtotal * (promo.value / 100) : promo.value;
      discount = roundCurrency(Math.min(subtotal, rawDiscount));
      appliedPromoCode = promo.code;
    }

    const discountedSubtotal = Math.max(0, roundCurrency(subtotal - discount));
    const shippingFee =
      input.channel === 'POS'
        ? 0
        : discountedSubtotal >= freeShippingThreshold
        ? 0
        : 25.0;

    const taxAmount = roundCurrency(discountedSubtotal * (taxRatePercent / 100));
    const total = roundCurrency(discountedSubtotal + shippingFee + taxAmount);

    const soldAt = new Date();
    const orderNumber = generateOrderNumber(input.channel);

    const order = await tx.order.create({
      data: {
        orderNumber,
        channel: input.channel,
        userId: req.user?.userId ?? null,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        shippingAddress: input.shippingAddress,
        paymentMethod: input.paymentMethod,
        promoCode: appliedPromoCode,
        status: input.channel === 'POS' ? 'COMPLETED' : 'PENDING',
        subtotal,
        discount,
        shippingFee,
        taxAmount,
        total,
      },
    });

    for (const line of preparedItems) {
      const orderItem = await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: line.productId,
          sku: line.sku,
          productName: line.productName,
          unitPrice: line.unitPrice,
          quantity: line.quantity,
          warrantyMonths: line.warrantyMonths,
          serialNumbers: JSON.stringify(line.serialStrings),
        },
      });

      const warrantyUntil = addMonths(soldAt, line.warrantyMonths);

      const updatedSerials = await tx.serialUnit.updateMany({
        where: {
          id: { in: line.serialUnitIds },
          status: 'IN_STOCK',
        },
        data: {
          status: 'SOLD',
          orderId: order.id,
          orderItemId: orderItem.id,
          customerName: input.customerName,
          soldAt,
          warrantyUntil,
        },
      });

      if (updatedSerials.count !== line.quantity) {
        throw new AppError(
          `Concurrent serial lock conflict for SKU ${line.sku}. Please retry.`,
          409,
          'SERIAL_CONCURRENCY_CONFLICT'
        );
      }

      await tx.product.update({
        where: { id: line.productId },
        data: {
          stock: { decrement: line.quantity },
        },
      });
    }

    return tx.order.findUniqueOrThrow({
      where: { id: order.id },
      include: {
        items: true,
        serialUnits: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                brand: true,
                category: true,
                warrantyMonths: true,
              },
            },
          },
          orderBy: { serial: 'asc' },
        },
      },
    });
  });

  const formattedOrder = {
    ...createdOrder,
    items: createdOrder.items.map((item) => ({
      ...item,
      allocatedSerials: safeParseSerials(item.serialNumbers),
    })),
  };

  res.status(201).json({ order: formattedOrder });
});

export const getOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const channel = typeof req.query.channel === 'string' ? req.query.channel.trim() : '';
  const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

  const where: Prisma.OrderWhereInput = {};

  if (channel && channel !== 'ALL') {
    where.channel = channel;
  }

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { customerName: { contains: search } },
      { customerEmail: { contains: search } },
      { serialUnits: { some: { serial: { contains: search } } } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      serialUnits: {
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
              brand: true,
              category: true,
              warrantyMonths: true,
            },
          },
        },
        orderBy: { serial: 'asc' },
      },
    },
  });

  const formatted = orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({
      ...item,
      allocatedSerials: safeParseSerials(item.serialNumbers),
    })),
  }));

  res.json({ orders: formatted });
});

export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.id;
    if (!orderId) {
      throw new AppError('Order ID is required.', 400);
    }

    const { status } = req.body as UpdateOrderStatusInput;

    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) {
      throw new AppError('Order not found.', 404, 'NOT_FOUND');
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: true,
        serialUnits: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                brand: true,
                category: true,
                warrantyMonths: true,
              },
            },
          },
          orderBy: { serial: 'asc' },
        },
      },
    });

    res.json({
      order: {
        ...updated,
        items: updated.items.map((item) => ({
          ...item,
          allocatedSerials: safeParseSerials(item.serialNumbers),
        })),
      },
    });
  }
);
