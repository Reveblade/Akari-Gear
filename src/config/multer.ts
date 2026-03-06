import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { isCloudinaryConfigured } from './cloudinary.js';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const productsDir = path.join(UPLOADS_DIR, 'products');

// Cloudinary: memory storage (buffer). Fallback: disk storage for local dev.
const memoryStorage = multer.memoryStorage();
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, productsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext.toLowerCase())
      ? ext.toLowerCase()
      : '.jpg';
    cb(null, `${uuidv4()}${safeExt}`);
  },
});

export const uploadProductImage = multer({
  storage: isCloudinaryConfigured ? memoryStorage : diskStorage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Sadece JPEG, PNG, WebP ve GIF formatları desteklenir'));
    }
  },
});
