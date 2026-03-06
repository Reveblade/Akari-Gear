import { Router } from 'express';
import * as exchangeRateController from '../controllers/exchangeRateController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public: get latest rate (for display, POS)
router.get('/', exchangeRateController.getLatestRate);

// Admin only: trigger manual fetch from TCMB
router.post(
  '/fetch',
  authenticate,
  requireAdmin,
  exchangeRateController.fetchAndSaveRate
);

// Admin only: set rate manually
router.post(
  '/set',
  authenticate,
  requireAdmin,
  exchangeRateController.setRateManually
);

export default router;
