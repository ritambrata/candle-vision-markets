
import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCandleData } from '../services/chartService';
import { CandleData } from '../types/chart';
import { toast } from 'sonner';

export function useChartData(
  symbol: string = 'NIFTY',
  interval: string = '5m',
  autoRefresh: boolean = true
) {
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to calculate date ranges
  const getDateRange = () => {
    const to = new Date();
    const from = new Date();
    // Get data for last 24 hours
    from.setDate(from.getDate() - 1);
    
    return {
      from: from.toISOString(),
      to: to.toISOString()
    };
  };

  // Setup the query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['candleData', symbol, interval],
    queryFn: async () => {
      const { from, to } = getDateRange();
      const response = await fetchCandleData(symbol, interval, from, to);
      
      // Process data to add mock put/call volumes for demonstration
      if (response.data && response.data.length) {
        return response.data.map(candle => ({
          ...candle,
          // Simulating put/call data for demo purposes
          putVolume: Math.floor(candle.volume * (0.3 + Math.random() * 0.2)),
          callVolume: Math.floor(candle.volume * (0.3 + Math.random() * 0.2))
        }));
      }
      
      return [];
    }
  });

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
      setLastRefreshed(new Date());
      toast.success("Chart data refreshed");
    } catch (error) {
      toast.error("Failed to refresh data");
      console.error(error);
    }
  }, [refetch]);

  // Setup auto refresh
  useEffect(() => {
    if (autoRefresh) {
      // Refresh every 2 minutes (120000ms)
      refreshTimerRef.current = setInterval(() => {
        handleRefresh();
      }, 120000);
    }
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, handleRefresh]);

  return {
    chartData: data as CandleData[] | undefined,
    isLoading,
    isError,
    lastRefreshed,
    refreshData: handleRefresh
  };
}
