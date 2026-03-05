/**
 * Seed script: creates initial admin user, categories, and products.
 * Run: npx tsx scripts/seed.ts
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { config } from '../src/config/index.js'
import { User } from '../src/models/User.js'
import { Category } from '../src/models/Category.js'
import { Product } from '../src/models/Product.js'
import { ExchangeRate } from '../src/models/ExchangeRate.js'
import { fetchUsdToTryFromTcmb } from '../src/services/exchangeRateService.js'

dotenv.config()

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

const mousepadSubcategories = [
  { name: 'Uzak Doğu', slug: 'uzak-dogu' },
  { name: 'Araba', slug: 'araba' },
  { name: 'Süper-Hero', slug: 'super-hero' },
]

const mouseSubcategories = [
  { name: 'Kablolu', slug: 'kablolu' },
  { name: 'Kablosuz', slug: 'kablosuz' },
]

const FEATURED_SLUGS = [
  'uzak-dogu-mousepad-1',
  'araba-mousepad-2',
  'super-hero-mousepad-1',
  'super-hero-mousepad-3',
  'kablolu-gaming-mouse',
  'kablosuz-gaming-mouse',
]

const mousepadProducts = [
  { name: 'Uzak Doğu Tema 1', slug: 'uzak-dogu-mousepad-1', subcategory: 'uzak-dogu', price: 24.99 },
  { name: 'Uzak Doğu Tema 2', slug: 'uzak-dogu-mousepad-2', subcategory: 'uzak-dogu', price: 29.99 },
  { name: 'Uzak Doğu Tema 3', slug: 'uzak-dogu-mousepad-3', subcategory: 'uzak-dogu', price: 19.99 },
  { name: 'Araba Tema 1', slug: 'araba-mousepad-1', subcategory: 'araba', price: 34.99 },
  { name: 'Araba Tema 2', slug: 'araba-mousepad-2', subcategory: 'araba', price: 39.99 },
  { name: 'Araba Tema 3', slug: 'araba-mousepad-3', subcategory: 'araba', price: 27.99 },
  { name: 'Süper-Hero Tema 1', slug: 'super-hero-mousepad-1', subcategory: 'super-hero', price: 44.99 },
  { name: 'Süper-Hero Tema 2', slug: 'super-hero-mousepad-2', subcategory: 'super-hero', price: 49.99 },
  { name: 'Süper-Hero Tema 3', slug: 'super-hero-mousepad-3', subcategory: 'super-hero', price: 54.99 },
  { name: 'Süper-Hero Tema 4', slug: 'super-hero-mousepad-4', subcategory: 'super-hero', price: 59.99 },
]

const mouseProducts = [
  { name: 'Kablolu Gaming Mouse', slug: 'kablolu-gaming-mouse', subcategory: 'kablolu', price: 45.99 },
  { name: 'Kablosuz Gaming Mouse', slug: 'kablosuz-gaming-mouse', subcategory: 'kablosuz', price: 69.99 },
]

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
    console.log(`Admin created: ${adminEmail} / ${adminPassword}`)
  }

  let mousepadsCategory = await Category.findOne({ slug: 'mousepads' })
  if (!mousepadsCategory) {
    mousepadsCategory = await Category.create({
      name: 'Mousepads',
      slug: 'mousepads',
      description: 'High-quality mousepads for gaming and productivity',
      isActive: true,
      sortOrder: 0,
      subcategories: mousepadSubcategories,
    })
    console.log('Mousepads category created')
  } else {
    await Category.findByIdAndUpdate(mousepadsCategory._id, {
      $set: { subcategories: mousepadSubcategories },
    })
    console.log('Mousepads category subcategories updated')
  }

  let mouseCategory = await Category.findOne({ slug: 'mouse' })
  if (!mouseCategory) {
    mouseCategory = await Category.create({
      name: 'Mouse',
      slug: 'mouse',
      description: 'Gaming and office mice',
      isActive: true,
      sortOrder: 1,
      subcategories: mouseSubcategories,
    })
    console.log('Mouse category created')
  } else {
    console.log('Mouse category already exists')
  }

  for (const p of mousepadProducts) {
    const existing = await Product.findOne({ slug: p.slug })
    if (!existing) {
      await Product.create({
        name: p.name,
        slug: p.slug,
        description: `${p.name} - Yüksek kaliteli mousepad`,
        price: p.price,
        category: mousepadsCategory._id,
        subcategory: p.subcategory,
        images: [],
        stock: 50,
        isActive: true,
        isFeatured: FEATURED_SLUGS.includes(p.slug),
      })
      console.log(`Mousepad product created: ${p.name}`)
    }
  }

  for (const p of mouseProducts) {
    const existing = await Product.findOne({ slug: p.slug })
    if (!existing) {
      await Product.create({
        name: p.name,
        slug: p.slug,
        description: `${p.name} - Ergonomik tasarım`,
        price: p.price,
        category: mouseCategory._id,
        subcategory: p.subcategory,
        images: [],
        stock: 30,
        isActive: true,
        isFeatured: FEATURED_SLUGS.includes(p.slug),
      })
      console.log(`Mouse product created: ${p.name}`)
    }
  }

  await Product.updateMany(
    { slug: { $in: FEATURED_SLUGS } },
    { $set: { isFeatured: true } }
  )
  console.log('Featured products updated')

  const today = startOfDay(new Date())
  const existingRate = await ExchangeRate.findOne({ date: today })
  if (!existingRate) {
    const usdToTry = await fetchUsdToTryFromTcmb()
    if (usdToTry !== null) {
      await ExchangeRate.create({ date: today, usdToTry, source: 'TCMB' })
      console.log(`Exchange rate seeded: USD/TRY = ${usdToTry}`)
    } else {
      await ExchangeRate.create({
        date: today,
        usdToTry: 34.5,
        source: 'TCMB_FALLBACK',
      })
      console.log('Exchange rate: TCMB unavailable, using fallback 34.5')
    }
  } else {
    console.log('Exchange rate for today already exists')
  }

  await mongoose.disconnect()
  console.log('Seed complete')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
