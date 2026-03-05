import { Router } from 'express';
import * as productController from '../../controllers/productController.js';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
} from '../../validators/productValidators.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', productController.listProducts);
router.get('/:slug', productController.getProduct);
router.post('/', createProductValidator, productController.createProduct);
router.put('/:id', updateProductValidator, productController.updateProduct);
router.delete('/:id', productIdValidator, productController.deleteProduct);

export default router;
