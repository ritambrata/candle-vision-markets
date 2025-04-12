
import { ChartApiResponse, CandleData } from '../types/chart';

// Using Alpha Vantage API (free tier)
const API_KEY = 'OPDADVHGW1EDOZ99'; // Using demo key, for production use your own key
const BASE_URL = 'https://www.alphavantage.co/query';

export async function fetchCandleData(
  symbol: string = 'RELIANCE.NSE',
  interval: string = '5min',
  from?: string,
  to?: string
): Promise<ChartApiResponse> {
  try {
    // Map our interval format to Alpha Vantage's format
    const alphaVantageInterval = mapIntervalToAlphaVantage(interval);
    
    // Parse the symbol correctly for Indian stock exchange symbols
    let cleanSymbol = symbol;
    // For BSE/NSE stocks, Alpha Vantage uses a different format
    if (symbol.includes('.BSE') || symbol.includes('.NSE')) {
      cleanSymbol = symbol.replace('.', ':');
    }
    
    // Build URL with query parameters
    const url = `${BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${cleanSymbol}&interval=${alphaVantageInterval}&apikey=${API_KEY}&outputsize=full`;
    console.log('Fetching data from:', url);
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if we got the demo API key message or error
    if (data.Information && data.Information.includes("API key")) {
      console.log("Using mock data due to API key limitations");
      return generateMockCandleData(symbol, 100);
    }
    
    // Check if we got a valid response
    if (data["Error Message"]) {
      console.error("API Error:", data["Error Message"]);
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
  
  // Set base price based on the stock (including Indian stocks)
  let basePrice = 
    symbol === 'RELIANCE.NSE' || symbol === 'RELIANCE.BSE' ? 2850 : 
    symbol === 'TCS.NSE' ? 3500 : 
    symbol === 'HDFCBANK.NSE' ? 1620 :
    symbol === 'INFY.NSE' ? 1450 :
    symbol === 'ICICIBANK.NSE' ? 1050 :
    symbol === 'ITC.NSE' ? 450 :
    symbol === 'SBIN.NSE' ? 780 :
    symbol === 'HINDUNILVR.NSE' ? 2550 :
    symbol === 'TATAMOTORS.NSE' ? 950 :
    symbol === 'AAPL' ? 180 : 
    symbol === 'MSFT' ? 350 : 
    symbol === 'GOOGL' ? 140 : 
    symbol === 'AMZN' ? 170 : 100;
  
  // Simulate market open hours for India (9:15 AM to 3:30 PM IST)
  // and account for time difference if needed
  let isIndianStock = symbol.includes('.NSE') || symbol.includes('.BSE');
  
  for (let i = 0; i < count; i++) {
    // Generate random price movements
    const volatilityFactor = isIndianStock ? 0.8 : 1.0; // Adjust volatility for market
    const change = (Math.random() - 0.5) * 2 * volatilityFactor; // Random between -1 and 1
    const percentChange = change / 100;
    
    const open = basePrice;
    const close = basePrice * (1 + percentChange);
    
    // Ensure high is the highest and low is the lowest
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    
    // Generate random volume (higher for large cap stocks)
    const volumeFactor = 
      symbol === 'RELIANCE.NSE' || symbol === 'TCS.NSE' || symbol === 'ICICIBANK.NSE' ? 2.0 :
      symbol === 'MSFT' || symbol === 'AAPL' ? 3.0 : 1.0;
    
    const volume = Math.floor((Math.random() * 1000000) + 100000) * volumeFactor;
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
