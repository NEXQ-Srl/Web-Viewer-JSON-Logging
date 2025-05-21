import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartDataItem } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';

interface LogsChartProps {
  chartData: ChartDataItem[];
  onSegmentClick?: (filter: { hour?: string; date?: string; level: string } | null) => void;
  viewMode: 'hour' | 'day';
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  fill: string;
  payload: ChartDataItem;
}

const customColors = {
  info: '#3b82f6',  // blue
  error: '#ef4444', // red
  warn: '#f59e0b',  // amber
  debug: '#10b981', // emerald
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<TooltipPayloadItem>; label?: string }) => {
  const { darkMode } = useTheme();


  const viewMode = payload && payload[0] && payload[0].payload && 'date' in payload[0].payload ? 'day' : 'hour';

  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className={`p-2 rounded-md shadow-md border ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-800'}`}>
      <p className="font-medium mb-1">
        <span className="text-muted-foreground">
          {viewMode === 'hour' ? 'Time:' : 'Date:'}
        </span>
        {viewMode === 'hour'
          ? `${label}:00 - ${label}:59`
          : label && typeof label === 'string' ? new Date(label).toLocaleDateString() : label
        }
      </p>

      {payload.map((entry: { name: string; value: number; fill: string }, index: number) => (
        <div key={`item-${index}`} className="flex items-center text-sm py-1">
          <div
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: entry.fill }}
          />
          <span className="mr-2">{entry.name}:</span>
          <span className="font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const LogsChart: React.FC<LogsChartProps> = ({ chartData, onSegmentClick, viewMode }) => {
  const { darkMode } = useTheme();

  const gridColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const axisColor = darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';

  const dataKey = viewMode === 'hour' ? 'hour' : 'date';
  const chartTitle = viewMode === 'hour' ? 'Log Activity by Hour' : 'Log Activity by Day';

  const handleBarClick = React.useCallback(
    (data: { payload: ChartDataItem }, level: string) => {
      if (!onSegmentClick) return;
      
      const filter = viewMode === 'hour'
        ? { hour: data.payload.hour, level }
        : { date: data.payload.date, level };
      
      onSegmentClick(filter);
    },
    [onSegmentClick, viewMode]
  );

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{chartTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full select-none">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis
                dataKey={dataKey}
                stroke={axisColor}
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
              />              <YAxis
                allowDecimals={false}
                stroke={axisColor}
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                fontSize={12}
                wrapperStyle={{ paddingTop: 10 }}
              />              <Bar
                dataKey="info"
                stackId="a"
                fill={customColors.info}
                name="Info"
                radius={[4, 4, 0, 0]}
                onClick={(data) => handleBarClick(data, 'info')}
                style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
              />
              <Bar
                dataKey="error"
                stackId="a"
                fill={customColors.error}
                name="Error"
                radius={[4, 4, 0, 0]}
                onClick={(data) => handleBarClick(data, 'error')}
                style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
              />
              <Bar
                dataKey="warn"
                stackId="a"
                fill={customColors.warn}
                name="Warning"
                radius={[4, 4, 0, 0]}
                onClick={(data) => handleBarClick(data, 'warn')}
                style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
              />
              <Bar
                dataKey="debug"
                stackId="a"
                fill={customColors.debug}
                name="Debug"
                radius={[4, 4, 0, 0]}
                onClick={(data) => handleBarClick(data, 'debug')}
                style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogsChart;
