import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { CreateRmaInput, UpdateRmaStatusInput } from '../schemas/rma.schema';

function generateRmaNumber(): string {
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `RMA-${rand}`;
}

export const getRmaTickets = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

  const where: Prisma.RmaTicketWhereInput = {};

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { ticketNumber: { contains: search } },
      { customerName: { contains: search } },
      { issueDescription: { contains: search } },
      { serialUnit: { serial: { contains: search } } },
      { serialUnit: { product: { sku: { contains: search } } } },
      { serialUnit: { product: { name: { contains: search } } } },
    ];
  }

  const tickets = await prisma.rmaTicket.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      serialUnit: {
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
              id: true,
              orderNumber: true,
              channel: true,
              customerEmail: true,
            },
          },
        },
      },
    },
  });

  res.json({ tickets });
});

export const createRmaTicket = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const input = req.body as CreateRmaInput;

  const createdTicket = await prisma.$transaction(async (tx) => {
    const serialUnit = await tx.serialUnit.findUnique({
      where: { serial: input.serial.toUpperCase() },
      include: {
        rmaTickets: {
          where: { status: { not: 'RESOLVED' } },
        },
      },
    });

    if (!serialUnit) {
      throw new AppError(
        `Serial / IMEI "${input.serial}" was not found in the VoltOps hardware registry.`,
        404,
        'SERIAL_NOT_FOUND'
      );
    }

    if (serialUnit.rmaTickets.length > 0) {
      throw new AppError(
        `Serial "${serialUnit.serial}" already has an open RMA ticket (${serialUnit.rmaTickets[0].ticketNumber}).`,
        409,
        'ACTIVE_RMA_EXISTS'
      );
    }

    const wasInStock = serialUnit.status === 'IN_STOCK';

    await tx.serialUnit.update({
      where: { id: serialUnit.id },
      data: {
        status: 'RMA',
        customerName: serialUnit.customerName || input.customerName,
      },
    });

    if (wasInStock) {
      await tx.product.update({
        where: { id: serialUnit.productId },
        data: {
          stock: { decrement: 1 },
        },
      });
    }

    const ticket = await tx.rmaTicket.create({
      data: {
        ticketNumber: generateRmaNumber(),
        serialUnitId: serialUnit.id,
        customerName: input.customerName,
        issueDescription: input.issueDescription,
        technicianNotes: input.technicianNotes ?? '',
        status: 'RECEIVED',
      },
      include: {
        serialUnit: {
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
                id: true,
                orderNumber: true,
                channel: true,
                customerEmail: true,
              },
            },
          },
        },
      },
    });

    return ticket;
  });

  res.status(201).json({ ticket: createdTicket });
});

export const updateRmaStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const ticketId = req.params.id;
  if (!ticketId) {
    throw new AppError('RMA Ticket ID is required.', 400);
  }

  const input = req.body as UpdateRmaStatusInput;

  const updated = await prisma.$transaction(async (tx) => {
    const existing = await tx.rmaTicket.findUnique({
      where: { id: ticketId },
      include: { serialUnit: true },
    });

    if (!existing) {
      throw new AppError('RMA repair ticket not found.', 404, 'NOT_FOUND');
    }

    const ticket = await tx.rmaTicket.update({
      where: { id: ticketId },
      data: {
        status: input.status,
        technicianNotes:
          typeof input.technicianNotes === 'string'
            ? input.technicianNotes
            : existing.technicianNotes,
      },
    });

    const wasSoldUnit = Boolean(existing.serialUnit.orderId || existing.serialUnit.soldAt);

    if (input.status === 'RESOLVED' && existing.status !== 'RESOLVED') {
      const targetUnitStatus = wasSoldUnit ? 'SOLD' : 'IN_STOCK';
      await tx.serialUnit.update({
        where: { id: existing.serialUnitId },
        data: { status: targetUnitStatus },
      });

      if (!wasSoldUnit) {
        await tx.product.update({
          where: { id: existing.serialUnit.productId },
          data: { stock: { increment: 1 } },
        });
      }
    } else if (input.status !== 'RESOLVED' && existing.status === 'RESOLVED') {
      const currentUnit = await tx.serialUnit.findUniqueOrThrow({
        where: { id: existing.serialUnitId },
      });
      if (currentUnit.status === 'IN_STOCK') {
        await tx.product.update({
          where: { id: currentUnit.productId },
          data: { stock: { decrement: 1 } },
        });
      }
      await tx.serialUnit.update({
        where: { id: existing.serialUnitId },
        data: { status: 'RMA' },
      });
    }

    return tx.rmaTicket.findUniqueOrThrow({
      where: { id: ticket.id },
      include: {
        serialUnit: {
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
                id: true,
                orderNumber: true,
                channel: true,
                customerEmail: true,
              },
            },
          },
        },
      },
    });
  });

  res.json({ ticket: updated });
});
