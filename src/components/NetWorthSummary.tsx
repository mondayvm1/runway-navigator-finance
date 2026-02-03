import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Target, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { IncomeEvent } from './IncomeManager';

interface NetWorthSummaryProps {
  assets: number;
  liabilities: number;
  creditCardDebt?: number;
  incomeEvents?: IncomeEvent[];
  incomeEnabled?: boolean;
}

const NetWorthSummary = ({ 
  assets, 
  liabilities, 
  creditCardDebt = 0,
  incomeEvents = [],
  incomeEnabled = true 
}: NetWorthSummaryProps) => {
  const [showCreditOnly, setShowCreditOnly] = useState(false);
  
  const displayedLiabilities = showCreditOnly ? creditCardDebt : liabilities;
  const netWorth = assets - displayedLiabilities;
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
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/50 border border-white/80 p-6 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-xl border border-emerald-100 text-center transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex justify-center mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="text-sm text-slate-600 font-medium mb-1">Total Assets</div>
          <div className="text-2xl font-bold text-emerald-600">{formatCurrency(assets)}</div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100/50 p-5 rounded-xl border border-red-100 text-center relative transition-all hover:shadow-md hover:-translate-y-0.5">
          <button
            onClick={() => setShowCreditOnly(!showCreditOnly)}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-red-200/50 transition-colors"
            title={showCreditOnly ? "Show all liabilities" : "Show credit cards only"}
          >
            {showCreditOnly ? (
              <ToggleRight className="h-4 w-4 text-red-600" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-red-400" />
            )}
          </button>
          <div className="flex justify-center mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="text-sm text-slate-600 font-medium mb-1">
            {showCreditOnly ? '🐉 Credit Card Debt' : 'Total Liabilities'}
          </div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(displayedLiabilities)}</div>
          {showCreditOnly && liabilities > creditCardDebt && (
            <div className="text-xs text-slate-500 mt-1">
              +{formatCurrency(liabilities - creditCardDebt)} slow debt
            </div>
          )}
        </div>
        
        <div className={`p-5 rounded-xl text-center transition-all hover:shadow-md hover:-translate-y-0.5 ${isPositive ? 'bg-gradient-to-br from-blue-50 to-indigo-100/50 border border-blue-100' : 'bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-100'}`}>
          <div className="flex justify-center mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${isPositive ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25' : 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/25'}`}>
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="text-sm text-slate-600 font-medium mb-1">Net Worth</div>
          <div className={`text-2xl font-bold ${isPositive ? 'text-blue-600' : 'text-amber-600'}`}>
            {formatCurrency(netWorth)}
          </div>
        </div>

        <div className={`p-5 rounded-xl text-center transition-all hover:shadow-md hover:-translate-y-0.5 ${
          incomeEnabled ? 'bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-100' : 'bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-100'
        }`}>
          <div className="flex justify-center mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${incomeEnabled ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/25' : 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-500/25'}`}>
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className={`text-sm font-medium mb-1 ${incomeEnabled ? 'text-slate-600' : 'text-slate-400'}`}>
            Projected Income (12mo)
          </div>
          <div className={`text-2xl font-bold ${incomeEnabled ? 'text-purple-600' : 'text-slate-400'}`}>
            {incomeEnabled ? formatCurrency(projectedIncome) : formatCurrency(0)}
          </div>
          {!incomeEnabled && incomeEvents.length > 0 && (
            <div className="text-xs text-slate-400 mt-1">
              Planning disabled
            </div>
          )}
        </div>
      </div>
      
      {incomeEnabled && projectedIncome > 0 && (
        <div className="mt-5 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-800">
                Potential Net Worth Impact
              </span>
            </div>
            <span className="text-lg font-bold text-purple-700">
              {formatCurrency(netWorth + projectedIncome)}
            </span>
          </div>
          <p className="text-xs text-purple-600 mt-1.5">
            Including planned income events over the next 12 months
          </p>
        </div>
      )}
    </div>
  );
};

export default NetWorthSummary;
