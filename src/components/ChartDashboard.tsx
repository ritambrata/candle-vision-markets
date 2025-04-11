
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CandlestickChart from './CandlestickChart';
import { useChartData } from '../hooks/useChartData';

// Updated symbols for Alpha Vantage API
const SYMBOLS = ['IBM', 'MSFT', 'AAPL', 'GOOGL', 'AMZN'];
const INTERVALS = [
  { value: '1m', label: '1 min' },
  { value: '5m', label: '5 min' },
  { value: '15m', label: '15 min' },
  { value: '30m', label: '30 min' },
  { value: '1h', label: '1 hour' },
];

const ChartDashboard: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('IBM');
  const [selectedInterval, setSelectedInterval] = useState<string>('5m');
  
  const { chartData, isLoading, isError, lastRefreshed, refreshData } = useChartData(
    selectedSymbol,
    selectedInterval,
    true
  );

  return (
    <Card className="h-full border-gray-800 bg-background shadow-xl">
      <CardHeader className="border-b border-gray-800 pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="font-bold text-xl">Stock Chart</CardTitle>
          
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">
              Last updated: {format(lastRefreshed, 'HH:mm:ss')}
            </span>
            <Button 
              onClick={refreshData} 
              variant="outline" 
              size="icon"
              className="h-8 w-8"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh data</span>
            </Button>
          </div>
        </div>
        
        <div className="flex gap-4 mt-3">
          <Select 
            defaultValue={selectedSymbol}
            onValueChange={(value) => setSelectedSymbol(value)}
          >
            <SelectTrigger className="w-[180px] bg-muted">
              <SelectValue placeholder="Select symbol" />
            </SelectTrigger>
            <SelectContent>
              {SYMBOLS.map((symbol) => (
                <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            defaultValue={selectedInterval}
            onValueChange={(value) => setSelectedInterval(value)}
          >
            <SelectTrigger className="w-[120px] bg-muted">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              {INTERVALS.map((interval) => (
                <SelectItem key={interval.value} value={interval.value}>
                  {interval.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 h-[70vh]">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-xl font-medium">Loading chart data...</div>
          </div>
        )}
        
        {isError && (
          <div className="flex items-center justify-center h-full">
            <div className="text-destructive text-xl font-medium">
              Failed to load chart data. Please try again.
            </div>
          </div>
        )}
        
        {!isLoading && !isError && chartData && chartData.length > 0 && (
          <CandlestickChart data={chartData} />
        )}
        
        {!isLoading && !isError && (!chartData || chartData.length === 0) && (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground text-xl font-medium">
              No chart data available for the selected parameters.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartDashboard;
