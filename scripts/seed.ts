/**
 * Seed script: creates initial admin user only.
 * Run: npx tsx scripts/seed.ts
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { config } from '../src/config/index.js'
import { User } from '../src/models/User.js'

dotenv.config()

async function seed(): Promise<void> {
  await mongoose.connect(config.mongodbUri)

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@akarigear.com'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ADmin123.!?'

  const existingAdmin = await User.findOne({ email: adminEmail })
  if (existingAdmin) {
    console.log('Admin user already exists')
  } else {
    await User.create({
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      emailVerified: true,
    })
    console.log(`Admin created: ${adminEmail}`)
  }

  await mongoose.disconnect()
  console.log('Seed complete')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
