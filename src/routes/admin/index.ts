import { Router } from 'express';
import authRoutes from '../authRoutes.js';
import adminRoutes from './adminRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import productRoutes from './productRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/', adminRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);

export default router;
