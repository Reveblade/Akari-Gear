import { Router } from 'express';
import * as cartController from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', cartController.addToCart);
router.patch('/items/:productId', cartController.updateCartItem);
router.delete('/items/:productId', cartController.removeFromCart);

export default router;
