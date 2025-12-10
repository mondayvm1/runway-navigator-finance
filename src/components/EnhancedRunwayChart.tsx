import { XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart, Bar, ComposedChart } from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import { IncomeEvent } from './IncomeManager';

interface EnhancedRunwayChartProps {
  savings: number;
  monthlyExpenses: number;
  months: number;
  incomeEvents?: IncomeEvent[];
  incomeEnabled?: boolean;
  visibleMonths?: number;
}

const EnhancedRunwayChart = ({ 
  savings, 
  monthlyExpenses, 
  months, 
  incomeEvents = [],
  incomeEnabled = true,
  visibleMonths = 12
}: EnhancedRunwayChartProps) => {
  
  const generateChartData = () => {
    if (monthlyExpenses <= 0) return [];
    
    const data = [];
    let balanceWithIncome = savings;
    let balanceWithoutIncome = savings;
    const today = new Date();
    
    // Use visibleMonths as the chart horizon
    const endMonth = visibleMonths;
    
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
      
      // Calculate net cashflow for this month (income - expenses)
      const netCashflow = incomeThisMonth - monthlyExpenses;
      
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
        expenses: monthlyExpenses,
        netCashflow: netCashflow,
        projectedFunds: balanceWithIncome, // Can go negative to show deficit
        monthLabel: projectionDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        incomeEnabled: incomeEnabled
      });
      
      // Stop if both are deeply negative
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
        <div className="bg-background p-4 border border-border shadow-lg rounded-lg">
          <p className="font-medium text-foreground">{data.monthLabel}</p>
          <div className="space-y-1 mt-2">
            <p className="text-primary font-semibold">
              Projected Funds: {formatCurrency(data.projectedFunds)}
            </p>
            {incomeEnabled && (
              <>
                <p className="text-green-600">
                  Income: +{formatCurrency(data.income)}
                </p>
                <p className="text-destructive">
                  Expenses: -{formatCurrency(data.expenses)}
                </p>
                <p className={`font-medium ${data.netCashflow >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  Net: {data.netCashflow >= 0 ? '+' : ''}{formatCurrency(data.netCashflow)}
                </p>
              </>
            )}
            {!incomeEnabled && (
              <p className="text-muted-foreground text-sm">
                Income planning disabled
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Find min/max for y-axis to handle negative values
  const minProjectedFunds = Math.min(...chartData.map(d => d.projectedFunds));
  const maxProjectedFunds = Math.max(...chartData.map(d => d.projectedFunds));
  const yAxisMin = Math.min(0, minProjectedFunds * 1.1);
  const yAxisMax = maxProjectedFunds * 1.1;

  return (
    <div className="w-full h-80 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="projectedFundsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.05}/>
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
            domain={[yAxisMin, yAxisMax]}
          />
          <Tooltip content={customTooltip} />
          
          {/* Projected funds area */}
          <Area
            type="monotone"
            dataKey="projectedFunds"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#projectedFundsGradient)"
          />
          
          {/* Zero line */}
          <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="3,3" strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary"></div>
          <span>Projected Funds</span>
        </div>
        {incomeEnabled && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <span>Based on income - expenses each month</span>
          </div>
        )}
        {!incomeEnabled && incomeEvents.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Income planning disabled ({incomeEvents.length} event{incomeEvents.length > 1 ? 's' : ''} available)
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedRunwayChart;
