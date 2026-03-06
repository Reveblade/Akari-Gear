import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import { uploadProductImage } from '../../config/multer.js';
import * as uploadController from '../../controllers/uploadController.js';
import fs from 'fs';
import path from 'path';

const router = Router();
const productsDir = path.join(process.cwd(), 'uploads', 'products');

router.use(authenticate, requireAdmin);

// Ensure uploads/products directory exists
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

router.post(
  '/',
  uploadProductImage.single('image'),
  (err: Error, _req: Request, res: Response, next: NextFunction) => {
    if (err) {
      if (err.message?.includes('File too large')) {
        return res.status(400).json({ error: 'Dosya 5MB\'dan küçük olmalıdır' });
      }
      return res.status(400).json({ error: err.message ?? 'Yükleme hatası' });
    }
    next();
  },
  uploadController.uploadImage
);

// DELETE /:filename for local files, or DELETE ?url=<cloudinary_url> for cloud
router.delete('/:filename?', uploadController.deleteImage);

export default router;
