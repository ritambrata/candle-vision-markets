import React, { useState } from 'react';
import { RefreshCw, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Command, CommandInput } from "@/components/ui/command";
import CandlestickChart from './CandlestickChart';
import { useChartData } from '../hooks/useChartData';

// Updated stock list including Indian stocks (NSE & BSE)
const AVAILABLE_STOCKS = [
  // Indian Stocks (NSE)
  { symbol: 'RELIANCE.BSE', name: 'Reliance Industries Ltd (BSE)' },
  { symbol: 'RELIANCE.NSE', name: 'Reliance Industries Ltd (NSE)' },
  { symbol: 'TCS.NSE', name: 'Tata Consultancy Services Ltd' },
  { symbol: 'HDFCBANK.NSE', name: 'HDFC Bank Ltd' },
  { symbol: 'INFY.NSE', name: 'Infosys Ltd' },
  { symbol: 'ITC.NSE', name: 'ITC Ltd' },
  { symbol: 'SBIN.NSE', name: 'State Bank of India' },
  { symbol: 'ICICIBANK.NSE', name: 'ICICI Bank Ltd' },
  { symbol: 'HINDUNILVR.NSE', name: 'Hindustan Unilever Ltd' },
  { symbol: 'TATAMOTORS.NSE', name: 'Tata Motors Ltd' },
  // US Stocks for comparison
  { symbol: 'IBM', name: 'International Business Machines' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' }
];

const INTERVALS = [
  { value: '1m', label: '1 min' },
  { value: '5m', label: '5 min' },
  { value: '15m', label: '15 min' },
  { value: '30m', label: '30 min' },
  { value: '1h', label: '1 hour' },
];

const ChartDashboard: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE.BSE');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInterval, setSelectedInterval] = useState<string>('5m');
  
  const { chartData, isLoading, isError, lastRefreshed, refreshData } = useChartData(
    selectedSymbol,
    selectedInterval,
    true
  );

  // Filter stocks based on search query
  const filteredStocks = AVAILABLE_STOCKS.filter(stock => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle stock selection from search results
  const handleSelectStock = (symbol: string) => {
    setSelectedSymbol(symbol);
    setSearchQuery('');
  };

  // Clear search input
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Card className="h-full border-gray-800 bg-background shadow-xl">
      <CardHeader className="border-b border-gray-800 pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="font-bold text-xl">Indian & Global Stock Chart</CardTitle>
          
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
        
        <div className="flex flex-col sm:flex-row gap-4 mt-3">
          <div className="relative flex-grow">
            <div className="relative">
              <Input
                placeholder="Search for a stock symbol or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 w-full bg-muted"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0" 
                  onClick={handleClearSearch}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
            
            {searchQuery && filteredStocks.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                <div className="p-1">
                  {filteredStocks.map((stock) => (
                    <button
                      key={stock.symbol}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-sm flex items-center justify-between"
                      onClick={() => handleSelectStock(stock.symbol)}
                    >
                      <span className="font-medium">{stock.symbol}</span>
                      <span className="text-muted-foreground text-sm">{stock.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {searchQuery && filteredStocks.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-4 text-center">
                <p className="text-muted-foreground">No stocks found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
          
          <Select 
            defaultValue={selectedInterval}
            onValueChange={(value) => setSelectedInterval(value)}
          >
            <SelectTrigger className="w-full sm:w-[120px] bg-muted">
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
        
        <div className="mt-2">
          <p className="text-sm">
            <span className="font-medium">Current Selection:</span> 
            <span className="ml-2 text-primary">{selectedSymbol}</span>
            {AVAILABLE_STOCKS.find(s => s.symbol === selectedSymbol)?.name && (
              <span className="ml-2 text-muted-foreground">
                ({AVAILABLE_STOCKS.find(s => s.symbol === selectedSymbol)?.name})
              </span>
            )}
          </p>
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
