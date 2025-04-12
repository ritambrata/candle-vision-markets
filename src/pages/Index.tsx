
import React from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import ChartDashboard from '@/components/ChartDashboard';

const Index = () => {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="container mx-auto">
          <header className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Stock Market Search</h1>
            <p className="text-muted-foreground mt-2">
              Search stocks and view real-time candlestick charts
            </p>
          </header>
          
          <div className="h-[80vh]">
            <ChartDashboard />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Index;
