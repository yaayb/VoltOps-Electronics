import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { updateSettingsSchema } from '../schemas/rma.schema';

export const settingsRouter = Router();

settingsRouter.get('/', getSettings);
settingsRouter.put(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  validateBody(updateSettingsSchema),
  updateSettings
);
