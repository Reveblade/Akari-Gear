import mongoose from 'mongoose';
import app from './app.js';
import { config } from './config/index.js';
import { scheduleExchangeRateJob } from './jobs/exchangeRateJob.js';

// Cloud Run: Port dinlemeyi hemen başlat (MongoDB'den önce), yoksa startup timeout olur
const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`Server listening on port ${config.port}`);
});

async function connectDb(): Promise<void> {
  try {
    await mongoose.connect(config.mongodbUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected');
    scheduleExchangeRateJob();
    if (config.env === 'development') {
      console.log(`Email links: reset/verify → ${config.urls.frontend}`);
    }
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    server.close(() => process.exit(1));
  }
}

connectDb();
