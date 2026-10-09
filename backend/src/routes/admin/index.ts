import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import adminRoutes from './adminRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import productRoutes from './productRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import orderRoutes from './orderRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

// All /api/admin/* routes require admin role (defense in depth)
router.use(authenticate, requireAdmin);

router.use('/upload', uploadRoutes);
router.use('/', adminRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);

export default router;
