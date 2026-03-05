import { Response } from 'express';
import { ExchangeRate } from '../models/ExchangeRate.js';
import { fetchUsdToTryFromTcmb } from '../services/exchangeRateService.js';
import { AuthRequest } from '../middleware/auth.js';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the latest USD/TRY rate (for today or most recent).
 */
export async function getLatestRate(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const rate = await ExchangeRate.findOne().sort({ date: -1 }).lean();

    if (!rate) {
      res.status(404).json({
        error: 'No exchange rate available. Run fetch or seed first.',
      });
      return;
    }

    res.json({
      rate: {
        usdToTry: rate.usdToTry,
        date: rate.date,
        source: rate.source,
      },
    });
  } catch (err) {
    console.error('Get rate error:', err);
    res.status(500).json({ error: 'Failed to fetch rate' });
  }
}

/**
 * Fetch rate from TCMB and save. Can be called by cron or manually by admin.
 */
export async function fetchAndSaveRate(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const usdToTry = await fetchUsdToTryFromTcmb();

    if (usdToTry === null) {
      res.status(502).json({
        error: 'Failed to fetch rate from TCMB. Try again later.',
      });
      return;
    }

    const today = startOfDay(new Date());

    await ExchangeRate.findOneAndUpdate(
      { date: today },
      { usdToTry, source: 'TCMB' },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Exchange rate updated',
      rate: { usdToTry, date: today, source: 'TCMB' },
    });
  } catch (err) {
    console.error('Fetch rate error:', err);
    res.status(500).json({ error: 'Failed to update exchange rate' });
  }
}
