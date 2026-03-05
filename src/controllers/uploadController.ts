import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { AuthRequest } from '../middleware/auth.js';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'products');

export async function uploadImage(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Dosya yüklenmedi' });
      return;
    }

    const url = `/uploads/products/${req.file.filename}`;
    res.status(201).json({ url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Yükleme başarısız' });
  }
}

export async function deleteImage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { filename } = req.params;
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
