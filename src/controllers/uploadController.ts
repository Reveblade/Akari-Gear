import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { AuthRequest } from '../middleware/auth.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'products');

export async function uploadImage(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Dosya yüklenmedi' });
      return;
    }

    if (isCloudinaryConfigured && req.file.buffer) {
      // Cloudinary: upload from buffer (data URI)
      const b64 = req.file.buffer.toString('base64');
      const dataUri = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataUri, { folder: 'products' });
      res.status(201).json({ url: result.secure_url });
      return;
    }

    // Fallback: local disk (req.file.path from multer diskStorage)
    const url = `/uploads/products/${req.file.filename}`;
    res.status(201).json({ url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Yükleme başarısız' });
  }
}

export async function deleteImage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const filename = req.params.filename;
    const urlParam = req.query.url as string | undefined;

    // Cloudinary: delete by URL (query param)
    if (isCloudinaryConfigured && urlParam?.includes('cloudinary.com')) {
      const match = urlParam.match(/\/upload\/[^/]+\/(.+?)(?:\.[^.]+)?$/);
      const publicId = match ? match[1] : null;
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
        res.json({ message: 'Dosya silindi' });
        return;
      }
    }

    // Local disk: delete by filename
    if (!filename || filename.includes('..') || filename.includes('/')) {
      res.status(400).json({ error: 'Geçersiz dosya adı' });
      return;
    }

    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ message: 'Dosya silindi' });
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ error: 'Silme başarısız' });
  }
}
