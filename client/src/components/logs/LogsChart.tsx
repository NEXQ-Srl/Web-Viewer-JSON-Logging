

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
}

const customColors = {
  info: '#3b82f6',  // blue
  error: '#ef4444', // red
  warn: '#f59e0b',  // amber
  debug: '#10b981', // emerald
};

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
  label?: string;
}) => {
  const { darkMode } = useTheme();
  
  if (!active || !payload || !payload.length) {
    return null;
  }
  
  return (
    <div className={`p-2 rounded-md shadow-md border ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-800'}`}>
      <p className="font-medium mb-1">
        <span className="text-muted-foreground">Time:</span> {label}:00 - {label}:59
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

const LogsChart: React.FC<LogsChartProps> = ({ chartData }) => {
  const { darkMode } = useTheme();
  
  const gridColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const axisColor = darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Log Activity by Hour</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full select-none">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis 
                dataKey="hour" 
                stroke={axisColor} 
                fontSize={12} 
                tickLine={false}
                axisLine={{ stroke: gridColor }}
              />
              <YAxis 
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
              />
              <Bar dataKey="info" stackId="a" fill={customColors.info} name="Info" radius={[4, 4, 0, 0]} />
              <Bar dataKey="error" stackId="a" fill={customColors.error} name="Error" radius={[4, 4, 0, 0]} />
              <Bar dataKey="warn" stackId="a" fill={customColors.warn} name="Warning" radius={[4, 4, 0, 0]} />
              <Bar dataKey="debug" stackId="a" fill={customColors.debug} name="Debug" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogsChart;
