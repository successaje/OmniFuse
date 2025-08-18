import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function PortfolioChart({ data }) {
  // Define colors for the chart segments
  const COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', 
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
    '#A4DE6C', '#D0ED57', '#FFC658', '#8884d8'
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="font-medium">{data.name}</p>
          <p>${data.value.toLocaleString()}</p>
          <p>{((data.value / data.total) * 100).toFixed(1)}% of portfolio</p>
        </div>
      );
    }
    return null;
  };

  // Don't render if no data
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No portfolio data available
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="#1f2937"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '12px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Helper function to prepare data for the chart
export function prepareChartData(positions) {
  if (!positions || !Array.isArray(positions)) return [];
  
  // Filter out positions with no value and sum values by asset
  const assetMap = new Map();
  
  positions.forEach(position => {
    if (!position.asset || !position.value) return;
    
    const assetName = position.asset.split('.')[0]; // Remove chain suffix if present
    const value = typeof position.value === 'number' ? position.value : 0;
    
    if (assetMap.has(assetName)) {
      assetMap.set(assetName, assetMap.get(assetName) + value);
    } else {
      assetMap.set(assetName, value);
    }
  });
  
  // Convert to array and sort by value (descending)
  const result = Array.from(assetMap.entries())
    .map(([name, value]) => ({
      name,
      value,
      total: Array.from(assetMap.values()).reduce((a, b) => a + b, 0)
    }))
    .sort((a, b) => b.value - a.value);
  
  return result;
}
