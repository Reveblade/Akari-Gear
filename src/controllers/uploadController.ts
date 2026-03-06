import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

export async function uploadImage(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!isCloudinaryConfigured) {
      res.status(503).json({ error: 'Cloudinary yapılandırılmamış. Lütfen CLOUDINARY_* ortam değişkenlerini ayarlayın.' });
      return;
    }

    if (!req.file?.buffer) {
      res.status(400).json({ error: 'Dosya yüklenmedi' });
      return;
    }

    const b64 = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, { folder: 'products' });
    res.status(201).json({ url: result.secure_url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Yükleme başarısız' });
  }
}

export async function deleteImage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const urlParam = req.query.url as string | undefined;

    if (!isCloudinaryConfigured) {
      res.status(503).json({ error: 'Cloudinary yapılandırılmamış.' });
      return;
    }

    if (!urlParam?.includes('cloudinary.com')) {
      res.status(400).json({ error: 'Geçersiz Cloudinary URL' });
      return;
    }

    const match = urlParam.match(/\/upload\/[^/]+\/(.+?)(?:\.[^.]+)?$/);
    const publicId = match ? match[1] : null;
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
      res.json({ message: 'Dosya silindi' });
    } else {
      res.status(400).json({ error: 'Geçersiz Cloudinary URL' });
    }
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ error: 'Silme başarısız' });
  }
}
