
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
  Label,
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
  
  // Custom candle rendering
  const renderCandlestick = (props: any) => {
    const { x, y, width, height, index } = props;
    const item = chartData[index];
    if (!item) return null;
    
    const isGain = item.close >= item.open;
    const color = isGain ? "#26a69a" : "#ef5350";
    const halfWidth = width / 2;
    
    // Calculate y positions
    const yOpen = item.open;
    const yClose = item.close;
    const yHigh = item.high;
    const yLow = item.low;
    
    return (
      <g key={`candle-${index}`}>
        {/* Wick line from high to low */}
        <line
          x1={x + halfWidth}
          y1={props.yScale(yHigh)}
          x2={x + halfWidth}
          y2={props.yScale(yLow)}
          stroke={color}
          strokeWidth={1}
        />
        
        {/* Candle body */}
        <rect
          x={x + width * 0.15}
          y={props.yScale(Math.max(yOpen, yClose))}
          width={width * 0.7}
          height={Math.max(2, Math.abs(props.yScale(yOpen) - props.yScale(yClose)))}
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
        
        {/* Candlesticks Implementation */}
        {chartData.map((item, index) => {
          return (
            <ReferenceLine
              key={`candle-ref-${index}`}
              yAxisId="price"
              x={item.timestamp}
              stroke="transparent"
              segment={[
                { x: index, y: item.low },
                { x: index, y: item.high }
              ]}
              ifOverflow="hidden"
              renderCustomizedShape={(props) => 
                renderCandlestick({ ...props, yScale: props.yAxis.scale, index })
              }
            />
          );
        })}
        
        {/* High line for better visualization */}
        <Line
          yAxisId="price"
          dataKey="high"
          stroke="transparent"
          dot={false}
        />
        
        {/* Low line for better visualization */}
        <Line
          yAxisId="price"
          dataKey="low"
          stroke="transparent"
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default CandlestickChart;
