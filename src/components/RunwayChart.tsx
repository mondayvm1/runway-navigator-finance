
import { useEffect, useRef } from 'react';
import { Bar } from 'recharts';
import { BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface RunwayChartProps {
  savings: number;
  monthlyExpenses: number;
  months: number;
}

const RunwayChart = ({ savings, monthlyExpenses, months }: RunwayChartProps) => {
  const generateChartData = () => {
    if (monthlyExpenses <= 0) return [];
    
    const data = [];
    let remainingSavings = savings;
    
    // Generate data for each month until savings run out
    for (let i = 0; i <= Math.ceil(months); i++) {
      if (i > 0) {
        remainingSavings -= monthlyExpenses;
      }
      
      // Don't show negative balances
      const balance = Math.max(0, remainingSavings);
      
      data.push({
        month: i,
        balance: balance,
      });
      
      // Stop if we've reached zero
      if (balance <= 0) break;
    }
    
    return data;
  };

  const chartData = generateChartData();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
          <p className="font-medium">{`Month ${label}`}</p>
          <p className="text-green-600">
            {`Remaining: ${formatCurrency(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-60 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <XAxis 
            dataKey="month" 
            label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            label={{ value: 'Balance', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={customTooltip} />
          <Bar 
            dataKey="balance" 
            fill="#4ade80" 
            name="Remaining Savings" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RunwayChart;
