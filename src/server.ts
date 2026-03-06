import mongoose from 'mongoose';
import app from './app.js';
import { config } from './config/index.js';
import { scheduleExchangeRateJob } from './jobs/exchangeRateJob.js';

async function start(): Promise<void> {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('MongoDB connected');

    scheduleExchangeRateJob();

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${config.port}`);
      if (config.env === 'development') {
        console.log(`Email links: reset/verify → ${config.urls.frontend}`);
      }
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();
