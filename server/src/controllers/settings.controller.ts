import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { asyncHandler } from '../middleware/error.middleware';
import { UpdateSettingsInput } from '../schemas/rma.schema';

export const getSettings = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  let settings = await prisma.storeSetting.findUnique({
    where: { id: 'singleton' },
  });

  if (!settings) {
    settings = await prisma.storeSetting.create({
      data: {
        id: 'singleton',
        storeName: 'VoltOps Electronics',
        freeShippingThreshold: 500,
        lowStockThreshold: 3,
        taxRatePercent: 0,
      },
    });
  }

  const promoCodes = await prisma.promoCode.findMany({
    orderBy: { createdAt: 'asc' },
  });

  res.json({
    settings,
    promoCodes,
  });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const input = req.body as UpdateSettingsInput;

  const result = await prisma.$transaction(async (tx) => {
    const settings = await tx.storeSetting.upsert({
      where: { id: 'singleton' },
      update: {
        storeName: input.storeName,
        freeShippingThreshold: input.freeShippingThreshold,
        lowStockThreshold: input.lowStockThreshold,
        taxRatePercent: input.taxRatePercent,
      },
      create: {
        id: 'singleton',
        storeName: input.storeName,
        freeShippingThreshold: input.freeShippingThreshold,
        lowStockThreshold: input.lowStockThreshold,
        taxRatePercent: input.taxRatePercent,
      },
    });

    if (input.promoCodes) {
      const incomingCodes = input.promoCodes.map((p) => p.code.toUpperCase());

      await tx.promoCode.deleteMany({
        where: {
          code: { notIn: incomingCodes },
        },
      });

      for (const promo of input.promoCodes) {
        const normalizedCode = promo.code.toUpperCase();
        await tx.promoCode.upsert({
          where: { code: normalizedCode },
          update: {
            type: promo.type,
            value: promo.value,
            minSpend: promo.minSpend,
            active: promo.active,
          },
          create: {
            code: normalizedCode,
            type: promo.type,
            value: promo.value,
            minSpend: promo.minSpend,
            active: promo.active,
          },
        });
      }
    }

    const promoCodes = await tx.promoCode.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return { settings, promoCodes };
  });

  res.json(result);
});
