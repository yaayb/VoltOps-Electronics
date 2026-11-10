import { Router } from 'express';
import { getSerials, lookupSerialPublic } from '../controllers/serial.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

export const serialRouter = Router();

serialRouter.get('/lookup/:serial', lookupSerialPublic);
serialRouter.get('/', requireAuth, requireRole('ADMIN', 'STAFF'), getSerials);
