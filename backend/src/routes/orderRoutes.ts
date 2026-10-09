import { Router } from 'express';
import * as orderController from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', orderController.createOrder);
router.get('/', orderController.getMyOrders);
router.get('/:orderId', orderController.getOrderById);

export default router;
