/**
 * Seed script: creates initial admin user and Mousepad category.
 * Run: npx tsx scripts/seed.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from '../src/config/index.js';
import { User } from '../src/models/User.js';
import { Category } from '../src/models/Category.js';

dotenv.config();

async function seed(): Promise<void> {
  await mongoose.connect(config.mongodbUri);

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@mousepad-store.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log('Admin user already exists');
  } else {
    await User.create({
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      emailVerified: true,
    });
    console.log(`Admin created: ${adminEmail} / ${adminPassword}`);
  }

  const existingCategory = await Category.findOne({ slug: 'mousepads' });
  if (!existingCategory) {
    await Category.create({
      name: 'Mousepads',
      slug: 'mousepads',
      description: 'High-quality mousepads for gaming and productivity',
      isActive: true,
      sortOrder: 0,
    });
    console.log('Mousepads category created');
  } else {
    console.log('Mousepads category already exists');
  }

  await mongoose.disconnect();
  console.log('Seed complete');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
