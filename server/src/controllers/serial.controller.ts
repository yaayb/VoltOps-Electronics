import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { AppError, asyncHandler } from '../middleware/error.middleware';

export const getSerials = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
  const productId = typeof req.query.productId === 'string' ? req.query.productId.trim() : '';

  const where: Prisma.SerialUnitWhereInput = {};

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (productId) {
    where.productId = productId;
  }

  if (search) {
    where.OR = [
      { serial: { contains: search } },
      { customerName: { contains: search } },
      { product: { sku: { contains: search } } },
      { product: { name: { contains: search } } },
      { order: { orderNumber: { contains: search } } },
    ];
  }

  const serials = await prisma.serialUnit.findMany({
    where,
    orderBy: [{ soldAt: 'desc' }, { serial: 'asc' }],
    include: {
      product: {
        select: {
          id: true,
          sku: true,
          name: true,
          brand: true,
          category: true,
          price: true,
          warrantyMonths: true,
          imageUrl: true,
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
          channel: true,
          customerName: true,
          customerEmail: true,
          createdAt: true,
        },
      },
      rmaTickets: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  res.json({ serials });
});

export const lookupSerialPublic = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const rawSerial = req.params.serial;
    if (!rawSerial) {
      throw new AppError('Serial number is required.', 400);
    }

    const unit = await prisma.serialUnit.findUnique({
      where: { serial: rawSerial.trim().toUpperCase() },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            brand: true,
            category: true,
            warrantyMonths: true,
            imageUrl: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
            channel: true,
            createdAt: true,
          },
        },
        rmaTickets: {
          select: {
            id: true,
            ticketNumber: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!unit) {
      throw new AppError(`No hardware unit registered under serial "${rawSerial}".`, 404, 'SERIAL_NOT_FOUND');
    }

    res.json({ serialUnit: unit });
  }
);
