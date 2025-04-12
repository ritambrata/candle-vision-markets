
import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  Line,
  ReferenceLine
} from 'recharts';
import { format } from 'date-fns';
import { CandleData } from '../types/chart';

interface CandlestickChartProps {
  data: CandleData[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background p-3 rounded border border-gray-700 text-sm shadow-lg">
        <p className="font-medium mb-1">
          {format(new Date(data.timestamp), 'MMM dd, yyyy HH:mm')}
        </p>
        <div className="grid grid-cols-2 gap-x-4 mt-1">
          <p>Open: <span className="font-medium">{data.open.toFixed(2)}</span></p>
          <p>Close: <span className="font-medium">{data.close.toFixed(2)}</span></p>
          <p>High: <span className="font-medium">{data.high.toFixed(2)}</span></p>
          <p>Low: <span className="font-medium">{data.low.toFixed(2)}</span></p>
        </div>
        <div className="mt-1 pt-1 border-t border-gray-700">
          <p>Volume: <span className="font-medium">{data.volume.toLocaleString()}</span></p>
          <p>Call Vol: <span className="text-chart-up font-medium">{data.callVolume?.toLocaleString()}</span></p>
          <p>Put Vol: <span className="text-chart-down font-medium">{data.putVolume?.toLocaleString()}</span></p>
        </div>
      </div>
    );
  }
  return null;
};

const formatXAxis = (tickItem: string) => {
  return format(new Date(tickItem), 'HH:mm');
};

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data }) => {
  // We need to reverse the data to show oldest first for better visualization
  const chartData = [...data].reverse();
  
  // Calculate domain padding for y-axis
  const allPrices = chartData.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const pricePadding = (maxPrice - minPrice) * 0.05;
  
  // Custom candlestick renderer function
  const renderCandlestick = (props: any) => {
    const { x, y, width, height, index, payload } = props;
    const isGain = chartData[index].close >= chartData[index].open;
    const color = isGain ? "#26a69a" : "#ef5350";
    const barWidth = Math.max(1, width * 0.7);
    
    // Calculate positions
    const xPos = x - barWidth / 2;
    const openY = y(chartData[index].open);
    const closeY = y(chartData[index].close);
    const highY = y(chartData[index].high);
    const lowY = y(chartData[index].low);
    
    return (
      <g key={`candle-${index}`}>
        {/* Wick line from high to low */}
        <line
          x1={x}
          y1={highY}
          x2={x}
          y2={lowY}
          stroke={color}
          strokeWidth={1}
        />
        
        {/* Candle body */}
        <rect
          x={xPos}
          y={Math.min(openY, closeY)}
          width={barWidth}
          height={Math.max(2, Math.abs(openY - closeY))}
          fill={color}
          stroke={color}
        />
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
        <XAxis 
          dataKey="timestamp"
          tickFormatter={formatXAxis}
          tick={{ fill: '#ccc', fontSize: 12 }}
          axisLine={{ stroke: '#555' }}
          minTickGap={20}
          scale="band"
        />
        <YAxis 
          yAxisId="price"
          domain={[minPrice - pricePadding, maxPrice + pricePadding]}
          tick={{ fill: '#ccc', fontSize: 12 }}
          axisLine={{ stroke: '#555' }}
          tickCount={8}
        />
        <YAxis 
          yAxisId="volume"
          orientation="right"
          domain={[0, 'dataMax']}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          tick={{ fill: '#ccc', fontSize: 12 }}
          axisLine={{ stroke: '#555' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {/* Volume Bars */}
        <Bar 
          yAxisId="volume"
          dataKey="putVolume"
          name="Put Volume"
          fill="#ef5350"
          opacity={0.7}
          stackId="volume"
          barSize={6}
        />
        <Bar 
          yAxisId="volume"
          dataKey="callVolume"
          name="Call Volume"
          fill="#26a69a"
          opacity={0.7}
          stackId="volume"
          barSize={6}
        />
        
        {/* These lines are hidden but needed to create the domain */}
        <Line
          yAxisId="price"
          dataKey="high"
          stroke="transparent"
          dot={false}
        />
        <Line
          yAxisId="price"
          dataKey="low"
          stroke="transparent"
          dot={false}
        />
        
        {/* Custom candlestick rendering */}
        {chartData.map((entry, index) => {
          const isGain = entry.close >= entry.open;
          const color = isGain ? "#26a69a" : "#ef5350";
          
          return (
            <g 
              className="candlestick" 
              key={`candle-${index}`}
            >
              {/* This will be custom rendered in the layer below */}
            </g>
          );
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default CandlestickChart;
