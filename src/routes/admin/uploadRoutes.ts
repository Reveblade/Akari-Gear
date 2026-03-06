import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import { uploadProductImage } from '../../config/multer.js';
import * as uploadController from '../../controllers/uploadController.js';

const router = Router();

router.use(authenticate, requireAdmin);

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

// DELETE ?url=<cloudinary_url>
router.delete('/', uploadController.deleteImage);

export default router;
