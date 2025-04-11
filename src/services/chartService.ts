
import { ChartApiResponse, CandleData } from '../types/chart';

// Using Alpha Vantage API (free tier)
const API_KEY = 'OPDADVHGW1EDOZ99'; // Using demo key, for production use your own key
const BASE_URL = 'https://www.alphavantage.co/query';

export async function fetchCandleData(
  symbol: string = 'IBM',
  interval: string = '5min',
  from?: string,
  to?: string
): Promise<ChartApiResponse> {
  try {
    // Map our interval format to Alpha Vantage's format
    const alphaVantageInterval = mapIntervalToAlphaVantage(interval);
    
    // Build URL with query parameters
    const url = `${BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${alphaVantageInterval}&apikey=${API_KEY}&outputsize=full`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if we got the demo API key message
    if (data.Information && data.Information.includes("demo API key")) {
      console.log("Using mock data due to demo API key limitations");
      return generateMockCandleData(symbol, 100);
    }
    
    return formatAlphaVantageResponse(data, symbol);
  } catch (error) {
    console.error('Failed to fetch candle data:', error);
    // Generate mock data in case of error
    return generateMockCandleData(symbol, 100);
  }
}

// Helper function to map our interval format to Alpha Vantage's format
function mapIntervalToAlphaVantage(interval: string): string {
  switch (interval) {
    case '1m': return '1min';
    case '5m': return '5min';
    case '15m': return '15min';
    case '30m': return '30min';
    case '1h': return '60min';
    default: return '5min'; // Default to 5min
  }
}

// Helper function to generate mock candle data
function generateMockCandleData(symbol: string, count: number): ChartApiResponse {
  const data: CandleData[] = [];
  const now = new Date();
  let basePrice = symbol === 'AAPL' ? 180 : 
                 symbol === 'MSFT' ? 350 : 
                 symbol === 'GOOGL' ? 140 : 
                 symbol === 'AMZN' ? 170 : 100;
  
  for (let i = 0; i < count; i++) {
    // Generate random price movements
    const change = (Math.random() - 0.5) * 2; // Random between -1 and 1
    const percentChange = change / 100;
    
    const open = basePrice;
    const close = basePrice * (1 + percentChange);
    
    // Ensure high is the highest and low is the lowest
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    
    // Generate random volume
    const volume = Math.floor(Math.random() * 1000000) + 100000;
    const putVolume = Math.floor(volume * (0.3 + Math.random() * 0.2));
    const callVolume = Math.floor(volume * (0.3 + Math.random() * 0.2));
    
    // Calculate timestamp
    const timestamp = new Date(now);
    timestamp.setMinutes(now.getMinutes() - (i * 5)); // 5 minutes interval
    
    data.push({
      timestamp: timestamp.toISOString(),
      open,
      high,
      low,
      close,
      volume,
      putVolume,
      callVolume
    });
    
    // Set the base price for the next candle
    basePrice = close;
  }
  
  // Return sorted by time (newest first)
  return {
    status: 'success',
    data: data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  };
}

// Process Alpha Vantage response to match our app's data structure
function formatAlphaVantageResponse(response: any, symbol: string): ChartApiResponse {
  try {
    const timeSeriesKey = Object.keys(response).find(key => key.includes('Time Series'));
    
    if (!timeSeriesKey || !response[timeSeriesKey]) {
      console.error('Invalid Alpha Vantage response format:', response);
      return generateMockCandleData(symbol, 100);
    }
    
    const timeSeries = response[timeSeriesKey];
    const formattedData: CandleData[] = [];
    
    // Convert Alpha Vantage data to our format
    Object.entries(timeSeries).forEach(([timestamp, values]: [string, any]) => {
      const volume = parseInt(values['5. volume'] || '0');
      
      // Create simulated put/call volumes for demonstration
      const putVolume = Math.floor(volume * (0.3 + Math.random() * 0.2));
      const callVolume = Math.floor(volume * (0.3 + Math.random() * 0.2));
      
      formattedData.push({
        timestamp,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume,
        putVolume,
        callVolume
      });
    });
    
    // Sort by timestamp (newest first)
    formattedData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Limit to last 100 candles for better performance
    const limitedData = formattedData.slice(0, 100);
    
    return { status: 'success', data: limitedData };
  } catch (error) {
    console.error('Error formatting Alpha Vantage response:', error);
    return generateMockCandleData(symbol, 100);
  }
}
