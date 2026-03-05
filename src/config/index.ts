import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/mousepad-store',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    expiresInSeconds: (() => {
      const v = process.env.JWT_EXPIRES_IN ?? '7d';
      const match = v.match(/^(\d+)d$/);
      return match ? parseInt(match[1], 10) * 24 * 60 * 60 : 7 * 24 * 60 * 60;
    })(),
  },
  email: {
    host: process.env.SMTP_HOST ?? 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT ?? '2525', 10),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.EMAIL_FROM ?? 'noreply@mousepad-store.com',
  },
  urls: {
    frontend: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    admin: process.env.ADMIN_URL ?? 'http://localhost:5174',
  },
} as const;
