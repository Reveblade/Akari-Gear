import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import * as adminOrderController from '../../controllers/adminOrderController.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', adminOrderController.listOrders);
router.get('/:id', adminOrderController.getOrder);
router.patch('/:id/status', adminOrderController.updateOrderStatus);

export default router;
