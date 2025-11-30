
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import { IncomeEvent } from './IncomeManager';

interface EnhancedRunwayChartProps {
  savings: number;
  monthlyExpenses: number;
  months: number;
  incomeEvents?: IncomeEvent[];
  incomeEnabled?: boolean;
}

const EnhancedRunwayChart = ({ 
  savings, 
  monthlyExpenses, 
  months, 
  incomeEvents = [],
  incomeEnabled = true 
}: EnhancedRunwayChartProps) => {
  
  const generateChartData = () => {
    if (monthlyExpenses <= 0) return [];
    
    const data = [];
    let remainingSavingsWithIncome = savings;
    let remainingSavingsWithoutIncome = savings;
    // Project a long enough horizon so planned income impact is obvious,
    // independent of the simple "months" estimate passed in
    const endMonth = 120; // simulate up to 10 years
    
    for (let i = 0; i <= endMonth; i++) {
      const currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() + i);
      
      // Apply monthly expenses to both scenarios
      if (i > 0) {
        remainingSavingsWithIncome -= monthlyExpenses;
        remainingSavingsWithoutIncome -= monthlyExpenses;
      }
      
      // Apply income events only if income is enabled
      let monthlyIncome = 0;
      if (incomeEnabled && incomeEvents.length > 0) {
        monthlyIncome = incomeEvents.reduce((total, event) => {
          const eventDate = new Date(event.date);
          const eventMonth = eventDate.getFullYear() * 12 + eventDate.getMonth();
          const currentMonth = currentDate.getFullYear() * 12 + currentDate.getMonth();
          
          if (event.frequency === 'one-time') {
            // One-time: only in the exact month
            if (eventMonth === currentMonth) {
              return total + event.amount;
            }
          } else if (event.frequency === 'monthly') {
            // Monthly: every month starting from event date until end date (if specified)
            const endDate = event.endDate ? new Date(event.endDate) : null;
            const endMonth = endDate ? endDate.getFullYear() * 12 + endDate.getMonth() : Infinity;
            
            if (currentMonth >= eventMonth && currentMonth <= endMonth) {
              return total + event.amount;
            }
          } else if (event.frequency === 'yearly') {
            // Yearly: on anniversary month each year
            const monthsSinceEvent = currentMonth - eventMonth;
            if (monthsSinceEvent >= 0 && monthsSinceEvent % 12 === 0) {
              return total + event.amount;
            }
          }
          
          return total;
        }, 0);
      }
      
      remainingSavingsWithIncome += monthlyIncome;
      
      data.push({
        month: i,
        balance: Math.max(0, remainingSavingsWithIncome),
        balanceWithIncome: Math.max(0, remainingSavingsWithIncome),
        balanceWithoutIncome: Math.max(0, remainingSavingsWithoutIncome),
        income: monthlyIncome,
        monthLabel: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        incomeEnabled: incomeEnabled
      });
      
      // Stop if both scenarios have reached zero and no more income
      if (remainingSavingsWithIncome <= 0 && remainingSavingsWithoutIncome <= 0 && monthlyIncome === 0) {
        break;
      }
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
            <p className={`${incomeEnabled ? 'text-blue-600' : 'text-gray-600'}`}>
              {incomeEnabled ? 'Balance with Income' : 'Balance'}: {formatCurrency(data.balance)}
            </p>
            {incomeEnabled && data.income > 0 && (
              <p className="text-green-600">
                Monthly Income: +{formatCurrency(data.income)}
              </p>
            )}
            {incomeEnabled && (
              <p className="text-gray-600 text-sm">
                Without income: {formatCurrency(data.balanceWithoutIncome)}
              </p>
            )}
            {!incomeEnabled && incomeEvents.length > 0 && (
              <p className="text-gray-500 text-xs">
                Income planning disabled
              </p>
            )}
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
              <stop offset="5%" stopColor={incomeEnabled ? "#3b82f6" : "#6b7280"} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={incomeEnabled ? "#3b82f6" : "#6b7280"} stopOpacity={0.05}/>
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
          
          {/* Show baseline without income only if income is enabled */}
          {incomeEnabled && (
            <Area
              type="monotone"
              dataKey="balanceWithoutIncome"
              stroke="#ef4444"
              strokeWidth={1}
              fill="url(#noIncomeGradient)"
              strokeDasharray="5,5"
            />
          )}
          
          {/* Main balance area */}
          <Area
            type="monotone"
            dataKey="balance"
            stroke={incomeEnabled ? "#3b82f6" : "#6b7280"}
            strokeWidth={2}
            fill="url(#balanceGradient)"
          />
          
          {/* Zero line */}
          <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="3,3" />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded ${incomeEnabled ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
          <span>{incomeEnabled ? 'With Planned Income' : 'Current Balance'}</span>
        </div>
        {incomeEnabled && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-red-500 border-dashed rounded"></div>
            <span>Without Income</span>
          </div>
        )}
        {!incomeEnabled && incomeEvents.length > 0 && (
          <div className="text-xs text-gray-500">
            Income planning disabled ({incomeEvents.length} event{incomeEvents.length > 1 ? 's' : ''} available)
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedRunwayChart;
