import { Router } from 'express';
import * as categoryController from '../../controllers/categoryController.js';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator,
} from '../../validators/categoryValidators.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', categoryController.listCategories);
router.get('/:slug', categoryController.getCategory);
router.post('/', createCategoryValidator, categoryController.createCategory);
router.put('/:id', updateCategoryValidator, categoryController.updateCategory);
router.delete('/:id', categoryIdValidator, categoryController.deleteCategory);

export default router;
