/**
 * Delete user by email. Run: npx tsx scripts/delete-user.ts <email>
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from '../src/config/index.js';
import { User } from '../src/models/User.js';

dotenv.config();

const email = process.argv[2] ?? 'mertyildiz2002@gmail.com';

async function run(): Promise<void> {
  await mongoose.connect(config.mongodbUri);
  const result = await User.deleteOne({ email: email.toLowerCase() });
  console.log(result.deletedCount ? `Kullanıcı silindi: ${email}` : `Kullanıcı bulunamadı: ${email}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
