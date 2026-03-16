/**
 * In-memory cache for the latest USD/TRY exchange rate.
 * Rate changes once per day (TCMB), so caching reduces DB reads significantly.
 */
import { ExchangeRate } from '../models/ExchangeRate.js';

const TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedRate {
  usdToTry: number;
  date: Date;
  source: string;
  fetchedAt: number;
}

let cache: CachedRate | null = null;

export async function getLatestExchangeRate(): Promise<{
  usdToTry: number;
  date: Date;
  source: string;
} | null> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < TTL_MS) {
    return { usdToTry: cache.usdToTry, date: cache.date, source: cache.source };
  }

  const rate = await ExchangeRate.findOne().sort({ date: -1 }).lean();
  if (!rate) return null;

  cache = {
    usdToTry: rate.usdToTry,
    date: rate.date,
    source: rate.source,
    fetchedAt: now,
  };
  return { usdToTry: cache.usdToTry, date: cache.date, source: cache.source };
}

export function invalidateExchangeRateCache(): void {
  cache = null;
}
