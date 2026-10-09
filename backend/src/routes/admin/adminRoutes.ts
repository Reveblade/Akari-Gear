import { Router } from 'express';
import { createAdmin } from '../../controllers/adminAuthController.js';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import { registerValidator } from '../../validators/authValidators.js';

const router = Router();

router.post(
  '/admins',
  authenticate,
  requireAdmin,
  registerValidator,
  createAdmin
);

export default router;
