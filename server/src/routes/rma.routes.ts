import { Router } from 'express';
import {
  createRmaTicket,
  getRmaTickets,
  updateRmaStatus,
} from '../controllers/rma.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createRmaSchema, updateRmaStatusSchema } from '../schemas/rma.schema';

export const rmaRouter = Router();

rmaRouter.get('/', requireAuth, requireRole('ADMIN', 'STAFF'), getRmaTickets);
rmaRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'STAFF'),
  validateBody(createRmaSchema),
  createRmaTicket
);
rmaRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN', 'STAFF'),
  validateBody(updateRmaStatusSchema),
  updateRmaStatus
);
