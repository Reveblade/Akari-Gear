import { Router } from 'express';
import * as exchangeRateController from '../controllers/exchangeRateController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public: get latest rate (for display, POS)
router.get('/', exchangeRateController.getLatestRate);

// Admin only: trigger manual fetch
router.post(
  '/fetch',
  authenticate,
  requireAdmin,
  exchangeRateController.fetchAndSaveRate
);

export default router;
