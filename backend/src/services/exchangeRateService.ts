export const TCMB_XML_URL =
  'https://www.tcmb.gov.tr/kurlar/today.xml';

/**
 * Parse USD/TRY ForexSelling rate from TCMB XML.
 * TCMB publishes daily at 15:30 Turkey time on business days.
 */
export async function fetchUsdToTryFromTcmb(): Promise<number | null> {
  try {
    const res = await fetch(TCMB_XML_URL);
    const xml = await res.text();

    // Match: <Currency ... Kod="USD" ...> ... <ForexSelling>34.5678</ForexSelling>
    const match = xml.match(
      /<Currency[^>]*Kod="USD"[^>]*>[\s\S]*?<ForexSelling>([\d.]+)<\/ForexSelling>/i
    );

    if (!match) return null;

    const rate = parseFloat(match[1]);
    return Number.isFinite(rate) ? rate : null;
  } catch (err) {
    console.error('TCMB fetch error:', err);
    return null;
  }
}
