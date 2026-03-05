/**
 * Currency utilities: USD (stored) → TRY (display/POS)
 * All product prices are stored in USD.
 * Conversion to TRY uses daily rate with rounding up.
 */

/**
 * Round up to nearest whole TRY (kuruş not used for POS display).
 * Use Math.ceil for consistent rounding up.
 */
export function usdToTryRoundUp(priceUsd: number, rateUsdToTry: number): number {
  return Math.ceil(priceUsd * rateUsdToTry);
}

/**
 * Round up to 2 decimal places (for cases needing kuruş precision).
 */
export function usdToTryRoundUpDecimals(
  priceUsd: number,
  rateUsdToTry: number,
  decimals = 2
): number {
  const multiplied = priceUsd * rateUsdToTry;
  const factor = Math.pow(10, decimals);
  return Math.ceil(multiplied * factor) / factor;
}
