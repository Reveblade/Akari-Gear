/**
 * Drop entire database. Run: npx tsx scripts/drop-db.ts
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { config } from '../src/config/index.js'

dotenv.config()

async function run(): Promise<void> {
  await mongoose.connect(config.mongodbUri)
  await mongoose.connection.dropDatabase()
  console.log('Veritabanı silindi.')
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
