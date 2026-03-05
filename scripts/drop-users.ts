/**
 * Delete all users from DB. Run: npx tsx scripts/drop-users.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from '../src/config/index.js';
import { User } from '../src/models/User.js';

dotenv.config();

async function run(): Promise<void> {
  await mongoose.connect(config.mongodbUri);
  const result = await User.deleteMany({});
  console.log(`${result.deletedCount} kullanıcı silindi.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
