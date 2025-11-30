
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
    let balanceWithIncome = savings;
    let balanceWithoutIncome = savings;
    const today = new Date();
    
    // Base horizon from the simple months estimate we pass in
    const baseMonths = Math.max(Math.ceil(months) + 6, 12); // at least 1 year, extend a bit past

    // Find how far out income events matter
    let lastIncomeOffset = 0;
    incomeEvents.forEach(event => {
      const eventDate = new Date(event.date);
      const offset = (eventDate.getFullYear() - today.getFullYear()) * 12 + (eventDate.getMonth() - today.getMonth());
      if (offset > lastIncomeOffset) {
        lastIncomeOffset = offset;
      }
      // If it’s recurring without an end date, give it extra horizon
      if ((event.frequency === 'monthly' || event.frequency === 'yearly') && !event.endDate) {
        lastIncomeOffset = Math.max(lastIncomeOffset, offset + 24); // +2 years
      }
      if (event.endDate) {
        const endDate = new Date(event.endDate);
        const endOffset = (endDate.getFullYear() - today.getFullYear()) * 12 + (endDate.getMonth() - today.getMonth());
        if (endOffset > lastIncomeOffset) {
          lastIncomeOffset = endOffset;
        }
      }
    });

    // Final horizon: enough to cover runway + income, but never more than 5 years
    const endMonth = Math.min(Math.max(baseMonths, lastIncomeOffset + 12), 60);
    
    for (let i = 0; i <= endMonth; i++) {
      const projectionDate = new Date(today);
      projectionDate.setMonth(today.getMonth() + i);
      const projectionMonth = projectionDate.getFullYear() * 12 + projectionDate.getMonth();
      
      // Calculate income for this month
      let incomeThisMonth = 0;
      if (incomeEnabled && incomeEvents.length > 0) {
        incomeThisMonth = incomeEvents.reduce((total, event) => {
          const eventDate = new Date(event.date);
          const eventStartMonth = eventDate.getFullYear() * 12 + eventDate.getMonth();
          
          if (event.frequency === 'one-time') {
            // One-time payment: only add in the exact month it occurs
            if (projectionMonth === eventStartMonth) {
              return total + event.amount;
            }
          } else if (event.frequency === 'monthly') {
            // Monthly recurring: add every month starting from event date
            const endDate = event.endDate ? new Date(event.endDate) : null;
            const eventEndMonth = endDate ? endDate.getFullYear() * 12 + endDate.getMonth() : Infinity;
            
            if (projectionMonth >= eventStartMonth && projectionMonth <= eventEndMonth) {
              return total + event.amount;
            }
          } else if (event.frequency === 'yearly') {
            // Yearly: only on anniversary months
            const monthsSinceStart = projectionMonth - eventStartMonth;
            if (monthsSinceStart >= 0 && monthsSinceStart % 12 === 0) {
              return total + event.amount;
            }
          }
          
          return total;
        }, 0);
      }
      
      // First: add income for this month to the "with income" balance
      balanceWithIncome += incomeThisMonth;
      
      // Then: subtract expenses from both balances
      balanceWithIncome -= monthlyExpenses;
      balanceWithoutIncome -= monthlyExpenses;
      
      // Record the data point
      data.push({
        month: i,
        balance: Math.max(0, balanceWithIncome),
        balanceWithIncome: Math.max(0, balanceWithIncome),
        balanceWithoutIncome: Math.max(0, balanceWithoutIncome),
        income: incomeThisMonth,
        monthLabel: projectionDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        incomeEnabled: incomeEnabled
      });
      
      // Stop if both are deeply negative and no future income
      if (balanceWithIncome < -100000 && balanceWithoutIncome < -100000) {
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
