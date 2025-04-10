
import { ChartApiResponse } from '../types/chart';

const BASE_URL = 'https://api.dhan.co/charts/historical';

export async function fetchCandleData(
  symbol: string = 'NIFTY',
  interval: string = '5m',
  from?: string,
  to?: string
): Promise<ChartApiResponse> {
  try {
    // Build URL with query parameters
    const params = new URLSearchParams();
    params.append('symbol', symbol);
    params.append('interval', interval);
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const url = `${BASE_URL}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch candle data:', error);
    // Return empty data structure to prevent app from crashing
    return { status: 'error', data: [] };
  }
}
