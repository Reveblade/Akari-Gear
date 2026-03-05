import mongoose from 'mongoose';
import app from './app.js';
import { config } from './config/index.js';

async function start(): Promise<void> {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('MongoDB connected');

    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();
