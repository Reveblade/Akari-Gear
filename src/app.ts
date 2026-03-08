import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import exchangeRateRoutes from './routes/exchangeRateRoutes.js';
import adminRoutes from './routes/admin/index.js';

const app = express();

// Required for Cloud Run: trust proxy so express-rate-limit can identify client IPs
app.set('trust proxy', true);

const allowedOrigins = [config.urls.frontend, config.urls.admin].filter(Boolean);

app.use(
  cors({
    origin:
      allowedOrigins.length > 0
        ? (origin, cb) => {
            if (!origin || allowedOrigins.includes(origin)) {
              cb(null, true);
            } else {
              cb(null, false);
            }
          }
        : true,
    credentials: true,
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Çok fazla istek. Lütfen 15 dakika sonra tekrar deneyin.' },
});
app.use(express.json());
app.use(cookieParser());

// Cloud Run startup/liveness probe (sends GET /)
app.get('/', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/exchange-rate', exchangeRateRoutes);
app.use('/api/admin', adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
