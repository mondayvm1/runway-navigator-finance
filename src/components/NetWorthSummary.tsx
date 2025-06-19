
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Target, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { IncomeEvent } from './IncomeManager';

interface NetWorthSummaryProps {
  assets: number;
  liabilities: number;
  incomeEvents?: IncomeEvent[];
  incomeEnabled?: boolean;
}

const NetWorthSummary = ({ 
  assets, 
  liabilities, 
  incomeEvents = [],
  incomeEnabled = true 
}: NetWorthSummaryProps) => {
  const netWorth = assets - liabilities;
  const isPositive = netWorth >= 0;
  
  const calculateProjectedIncome = () => {
    if (!incomeEnabled || incomeEvents.length === 0) return 0;
    
    const now = new Date();
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    
    return incomeEvents.reduce((total, event) => {
      const eventDate = new Date(event.date);
      if (eventDate < now) return total;
      
      if (event.frequency === 'one-time') {
        return eventDate <= oneYearFromNow ? total + event.amount : total;
      } else if (event.frequency === 'monthly') {
        const monthsUntilEnd = event.endDate 
          ? Math.max(0, Math.ceil((new Date(event.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)))
          : 12;
        return total + (event.amount * Math.min(monthsUntilEnd, 12));
      } else if (event.frequency === 'yearly') {
        return total + event.amount;
      }
      return total;
    }, 0);
  };

  const projectedIncome = calculateProjectedIncome();

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="flex justify-center mb-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-sm text-gray-500">Total Assets</div>
          <div className="text-2xl font-bold text-green-700">{formatCurrency(assets)}</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="flex justify-center mb-2">
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
          <div className="text-sm text-gray-500">Total Liabilities</div>
          <div className="text-2xl font-bold text-red-700">{formatCurrency(liabilities)}</div>
        </div>
        
        <div className={`p-4 rounded-lg text-center ${isPositive ? 'bg-blue-50' : 'bg-yellow-50'}`}>
          <div className="flex justify-center mb-2">
            <DollarSign className={`h-6 w-6 ${isPositive ? 'text-blue-600' : 'text-yellow-600'}`} />
          </div>
          <div className="text-sm text-gray-500">Net Worth</div>
          <div className={`text-2xl font-bold ${isPositive ? 'text-blue-700' : 'text-yellow-700'}`}>
            {formatCurrency(netWorth)}
          </div>
        </div>

        <div className={`p-4 rounded-lg text-center transition-all ${
          incomeEnabled ? 'bg-purple-50' : 'bg-gray-50'
        }`}>
          <div className="flex justify-center mb-2">
            <Sparkles className={`h-6 w-6 ${incomeEnabled ? 'text-purple-600' : 'text-gray-400'}`} />
          </div>
          <div className={`text-sm ${incomeEnabled ? 'text-gray-500' : 'text-gray-400'}`}>
            Projected Income (12mo)
          </div>
          <div className={`text-2xl font-bold ${incomeEnabled ? 'text-purple-700' : 'text-gray-500'}`}>
            {incomeEnabled ? formatCurrency(projectedIncome) : formatCurrency(0)}
          </div>
          {!incomeEnabled && incomeEvents.length > 0 && (
            <div className="text-xs text-gray-400 mt-1">
              Planning disabled
            </div>
          )}
        </div>
      </div>
      
      {incomeEnabled && projectedIncome > 0 && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                Potential Net Worth Impact
              </span>
            </div>
            <span className="text-lg font-bold text-purple-700">
              {formatCurrency(netWorth + projectedIncome)}
            </span>
          </div>
          <p className="text-xs text-purple-600 mt-1">
            Including planned income events over the next 12 months
          </p>
        </div>
      )}
    </Card>
  );
};

export default NetWorthSummary;
