import cron from 'node-cron';
import { ExchangeRate } from '../models/ExchangeRate.js';
import { fetchUsdToTryFromTcmb } from '../services/exchangeRateService.js';
import { invalidateExchangeRateCache } from '../services/exchangeRateCache.js';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function runFetch(): Promise<void> {
  try {
    const usdToTry = await fetchUsdToTryFromTcmb();
    if (usdToTry === null) {
      console.warn('[ExchangeRate] TCMB fetch failed, skipping');
      return;
    }

    const today = startOfDay(new Date());
    await ExchangeRate.findOneAndUpdate(
      { date: today },
      { usdToTry, source: 'TCMB' },
      { upsert: true }
    );
    invalidateExchangeRateCache();
    console.log(`[ExchangeRate] Updated USD/TRY: ${usdToTry} (${today.toISOString().slice(0, 10)})`);
  } catch (err) {
    console.error('[ExchangeRate] Job error:', err);
  }
}

/**
 * Schedule daily USD/TRY fetch. TCMB publishes at 15:30 Turkey time.
 * Runs at 16:00 server local time, weekdays only.
 * Override with CRON_EXCHANGE_RATE env (e.g. "0 16 * * 1-5").
 */
export function scheduleExchangeRateJob(): void {
  const schedule = process.env.CRON_EXCHANGE_RATE ?? '0 16 * * 1-5';
  cron.schedule(schedule, runFetch);
  console.log(`[ExchangeRate] Cron scheduled: ${schedule}`);
}
