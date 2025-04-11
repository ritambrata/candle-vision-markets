
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

// Custom candlestick renderer component
const CandlestickRenderer = (props: any) => {
  const { chartData, xScale, yScale, width } = props;
  
  return (
    <g className="candlestick-layer">
      {chartData.map((item: CandleData, index: number) => {
        const x = xScale(item.timestamp);
        const isGain = item.close >= item.open;
        const color = isGain ? "#26a69a" : "#ef5350";
        const barWidth = width * 0.7 / chartData.length;
        
        // Calculate y positions using the y scale function
        const yOpen = yScale(item.open);
        const yClose = yScale(item.close);
        const yHigh = yScale(item.high);
        const yLow = yScale(item.low);
        
        // Position for candlestick
        const candleX = x - barWidth / 2;
        
        return (
          <g key={`candle-${index}`}>
            {/* Wick line from high to low */}
            <line
              x1={x}
              y1={yHigh}
              x2={x}
              y2={yLow}
              stroke={color}
              strokeWidth={1}
            />
            
            {/* Candle body */}
            <rect
              x={candleX}
              y={Math.min(yOpen, yClose)}
              width={barWidth}
              height={Math.max(2, Math.abs(yOpen - yClose))}
              fill={color}
              stroke={color}
            />
          </g>
        );
      })}
    </g>
  );
};

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data }) => {
  // We need to reverse the data to show oldest first for better visualization
  const chartData = [...data].reverse();
  
  // Calculate domain padding for y-axis
  const allPrices = chartData.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const pricePadding = (maxPrice - minPrice) * 0.05;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
      >
        <defs>
          <clipPath id="candlestickClip">
            <rect x="0" y="0" width="100%" height="100%" />
          </clipPath>
        </defs>
        
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
        
        {/* Use a Layer element to add custom rendering */}
        <Line
          yAxisId="price"
          dataKey="close"
          stroke="transparent"
          dot={false}
          isAnimationActive={false}
          legendType="none"
        >
          {/* Custom layer for candlesticks */}
          {(props) => {
            // Extract the scale functions from the chart
            const { xAxis, yAxis, width } = props;
            if (!xAxis || !yAxis) return null;
            
            const xScale = xAxis.scale;
            const yScale = yAxis.scale;
            
            return (
              <CandlestickRenderer 
                chartData={chartData} 
                xScale={xScale} 
                yScale={yScale} 
                width={width}
              />
            );
          }}
        </Line>
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default CandlestickChart;
