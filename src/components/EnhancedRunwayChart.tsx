
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import { IncomeEvent } from './IncomeManager';

interface EnhancedRunwayChartProps {
  savings: number;
  monthlyExpenses: number;
  months: number;
  incomeEvents?: IncomeEvent[];
}

const EnhancedRunwayChart = ({ savings, monthlyExpenses, months, incomeEvents = [] }: EnhancedRunwayChartProps) => {
  
  const generateChartData = () => {
    if (monthlyExpenses <= 0) return [];
    
    const data = [];
    let remainingSavings = savings;
    const endMonth = Math.max(Math.ceil(months) + 6, 12); // Show at least 12 months
    
    for (let i = 0; i <= endMonth; i++) {
      const currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() + i);
      
      // Apply monthly expenses
      if (i > 0) {
        remainingSavings -= monthlyExpenses;
      }
      
      // Apply income events for this month
      const monthlyIncome = incomeEvents.reduce((total, event) => {
        const eventDate = new Date(event.date);
        const eventMonth = eventDate.getFullYear() * 12 + eventDate.getMonth();
        const currentMonth = currentDate.getFullYear() * 12 + currentDate.getMonth();
        
        if (event.frequency === 'one-time' && eventMonth === currentMonth) {
          return total + event.amount;
        } else if (event.frequency === 'monthly') {
          const endDate = event.endDate ? new Date(event.endDate) : null;
          if (eventMonth <= currentMonth && (!endDate || currentDate <= endDate)) {
            return total + event.amount;
          }
        } else if (event.frequency === 'yearly') {
          const eventAnnualDate = new Date(currentDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
          if (eventAnnualDate.getTime() === currentDate.getTime()) {
            return total + event.amount;
          }
        }
        
        return total;
      }, 0);
      
      remainingSavings += monthlyIncome;
      
      data.push({
        month: i,
        balance: Math.max(0, remainingSavings),
        balanceWithIncome: Math.max(0, remainingSavings),
        balanceWithoutIncome: Math.max(0, i === 0 ? savings : data[i-1].balanceWithoutIncome - monthlyExpenses),
        income: monthlyIncome,
        monthLabel: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      });
      
      // Stop if we've reached zero and no more income
      if (remainingSavings <= 0 && monthlyIncome === 0) break;
    }
    
    return data;
  };

  const chartData = generateChartData();
  
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-medium text-gray-800">{data.monthLabel}</p>
          <div className="space-y-1 mt-2">
            <p className="text-blue-600">
              Balance: {formatCurrency(data.balance)}
            </p>
            {data.income > 0 && (
              <p className="text-green-600">
                Income: +{formatCurrency(data.income)}
              </p>
            )}
            <p className="text-gray-600 text-sm">
              Without income: {formatCurrency(data.balanceWithoutIncome)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="noIncomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="monthLabel" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value).replace('.00', '')}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={customTooltip} />
          
          {/* Area showing balance without income (baseline) */}
          <Area
            type="monotone"
            dataKey="balanceWithoutIncome"
            stroke="#ef4444"
            strokeWidth={1}
            fill="url(#noIncomeGradient)"
            strokeDasharray="5,5"
          />
          
          {/* Area showing balance with income */}
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#balanceGradient)"
          />
          
          {/* Zero line */}
          <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="3,3" />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>With Planned Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-red-500 border-dashed rounded"></div>
          <span>Without Income</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedRunwayChart;
