import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import * as adminUserController from '../../controllers/adminUserController.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', adminUserController.listUsers);
router.get('/:id/orders', adminUserController.getUserOrders);
router.get('/:id', adminUserController.getUser);
router.patch('/:id/block', adminUserController.blockUser);
router.patch('/:id/unblock', adminUserController.unblockUser);
router.delete('/:id', adminUserController.deleteUser);

export default router;
