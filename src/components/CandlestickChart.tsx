
import React, { useCallback } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  ReferenceLine,
  Rectangle
} from 'recharts';
import { format } from 'date-fns';
import { CandleData } from '../types/chart';

interface CandlestickChartProps {
  data: CandleData[];
}

// Custom Candlestick component
const Candlestick = (props: any) => {
  const { x, y, width, height, open, close, low, high } = props;
  const isGrowing = close > open;
  const color = isGrowing ? '#26a69a' : '#ef5350';
  const ratio = Math.abs(height / (open - close));

  return (
    <g>
      <line
        x1={x + width / 2}
        y1={y}
        x2={x + width / 2}
        y2={y + height}
        stroke={color}
        strokeWidth={1}
      />
      <rect
        x={x}
        y={isGrowing ? y + (close - open) * ratio : y}
        width={width}
        height={Math.abs((close - open) * ratio)}
        fill={color}
      />
    </g>
  );
};

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-chart-tooltip p-2 rounded border border-gray-700 text-sm">
        <p className="font-semibold">
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
  const renderCandlestickItem = useCallback(
    (props: any) => {
      const { x, y, width, openClose, highLow } = props;
      const candleProps = {
        x,
        y,
        width,
        height: Math.abs(openClose[1] - openClose[0]),
        open: openClose[0],
        close: openClose[1],
        low: highLow[0],
        high: highLow[1]
      };
      return <Candlestick {...candleProps} />;
    },
    []
  );

  const formatData = data.map(item => ({
    ...item,
    timestamp: new Date(item.timestamp).toISOString(),
    openClose: [item.open, item.close],
    highLow: [item.low, item.high]
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={formatData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatXAxis}
          tick={{ fill: '#cccccc', fontSize: 12 }}
          axisLine={{ stroke: '#555555' }}
        />
        <YAxis
          yAxisId="price"
          domain={['auto', 'auto']}
          tick={{ fill: '#cccccc', fontSize: 12 }}
          axisLine={{ stroke: '#555555' }}
        />
        <YAxis
          yAxisId="volume"
          orientation="right"
          domain={[0, 'dataMax']}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          tick={{ fill: '#cccccc', fontSize: 12 }}
          axisLine={{ stroke: '#555555' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {/* Candlestick */}
        <ReferenceLine
          yAxisId="price"
          isFront={false}
          ifOverflow="extendDomain"
          stroke="transparent"
          segment={formatData.map((d) => ({
            x: d.timestamp,
            y: d.highLow[0],
            x2: d.timestamp,
            y2: d.highLow[1]
          }))}
          shape={renderCandlestickItem}
        />
        
        {/* Volume Bars */}
        <Bar
          yAxisId="volume"
          dataKey="putVolume"
          name="Put Volume"
          fill="#ef5350"
          opacity={0.5}
          barSize={3}
        />
        <Bar
          yAxisId="volume"
          dataKey="callVolume"
          name="Call Volume"
          fill="#26a69a"
          opacity={0.5}
          barSize={3}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default CandlestickChart;
