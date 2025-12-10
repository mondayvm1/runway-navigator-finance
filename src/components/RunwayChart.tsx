import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import EnhancedRunwayChart from './EnhancedRunwayChart';
import { IncomeEvent } from './IncomeManager';
import { AccountItem } from '@/hooks/useFinancialData';
import { formatCurrency } from '@/utils/formatters';
import { Calendar, TrendingUp } from 'lucide-react';

interface RunwayChartProps {
  getTotalAssets: () => number;
  getTotalLiabilities: () => number;
  accountData: {
    cash: AccountItem[];
    investments: AccountItem[];
    credit: AccountItem[];
    loans: AccountItem[];
    otherAssets: AccountItem[];
  };
  monthlyExpenses: number;
  runway: {
    days: number;
    months: number;
    withIncomeMonths: number;
    additionalMonthsFromIncome: number;
  };
  incomeEvents: IncomeEvent[];
  incomeEnabled: boolean;
  hiddenCategories: {
    cash: boolean;
    investments: boolean;
    credit: boolean;
    loans: boolean;
    otherAssets: boolean;
  };
}

const RunwayChart = ({
  getTotalAssets,
  getTotalLiabilities,
  accountData,
  monthlyExpenses,
  runway,
  incomeEvents,
  incomeEnabled,
  hiddenCategories
}: RunwayChartProps) => {
  const [selectedCategories, setSelectedCategories] = useState<{
    cash: boolean;
    investments: boolean;
    otherAssets: boolean;
  }>({
    cash: true,
    investments: false,
    otherAssets: false,
  });

  // Calculate savings based on selected categories
  const getSavingsAmount = () => {
    let total = 0;
    
    if (selectedCategories.cash) {
      total += accountData.cash.reduce((sum, account) => sum + account.balance, 0);
    }
    if (selectedCategories.investments) {
      total += accountData.investments.reduce((sum, account) => sum + account.balance, 0);
    }
    if (selectedCategories.otherAssets) {
      total += accountData.otherAssets.reduce((sum, account) => sum + account.balance, 0);
    }
    
    return total;
  };

  const toggleCategory = (category: keyof typeof selectedCategories) => {
    setSelectedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getModeLabel = () => {
    const active = [];
    if (selectedCategories.cash) active.push('Cash');
    if (selectedCategories.investments) active.push('Investments');
    if (selectedCategories.otherAssets) active.push('Other Assets');
    
    return active.length > 0 ? active.join(' + ') : 'None Selected';
  };

  const getModeDescription = () => {
    const active = [];
    if (selectedCategories.cash) active.push('cash accounts');
    if (selectedCategories.investments) active.push('investments');
    if (selectedCategories.otherAssets) active.push('other assets');
    
    return active.length > 0 
      ? `Using ${active.join(', ')} for runway calculation`
      : 'No categories selected';
  };

  // Choose which runway number to display based on income toggle
  const displayRunwayMonths = incomeEnabled ? runway.withIncomeMonths : runway.months;
  const savingsAmount = getSavingsAmount();

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-700">Financial Runway Chart</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategories.cash ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleCategory('cash')}
            >
              Cash
            </Button>
            <Button
              variant={selectedCategories.investments ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleCategory('investments')}
            >
              Investments
            </Button>
            <Button
              variant={selectedCategories.otherAssets ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleCategory('otherAssets')}
            >
              Other Assets
            </Button>
          </div>
        </div>

        {/* Visual Runway Slider */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Calendar className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-semibold text-indigo-900">Financial Runway</h4>
              <p className="text-xs text-indigo-600">{getModeDescription()}</p>
            </div>
          </div>
          
          {/* Large Runway Display */}
          <div className="text-center mb-6">
            <div className="inline-flex items-baseline gap-2">
              <span className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {displayRunwayMonths >= 60 ? '60+' : Math.floor(displayRunwayMonths)}
              </span>
              <span className="text-2xl text-indigo-400">
                {displayRunwayMonths >= 60 ? '' : `.${Math.round((displayRunwayMonths % 1) * 10)}`}
              </span>
              <span className="text-xl text-indigo-600 font-medium">months</span>
            </div>
            <p className="text-sm text-indigo-500 mt-1">
              ≈ {displayRunwayMonths >= 60 ? '5+ years' : `${(displayRunwayMonths / 12).toFixed(1)} years`}
            </p>
          </div>

          {/* Interactive Slider Visualization */}
          <div className="space-y-3">
            <div className="relative">
              <Slider
                value={[Math.min(displayRunwayMonths, 60)]}
                max={60}
                step={0.1}
                disabled
                className="cursor-default [&_[role=slider]]:bg-indigo-600 [&_[role=slider]]:border-indigo-700 [&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:shadow-lg"
              />
            </div>
            
            {/* Milestone markers */}
            <div className="flex justify-between text-xs text-indigo-400 px-1">
              <span>0</span>
              <span className="flex flex-col items-center">
                <span>3m</span>
                <span className="text-[10px]">Emergency</span>
              </span>
              <span className="flex flex-col items-center">
                <span>6m</span>
                <span className="text-[10px]">Stable</span>
              </span>
              <span className="flex flex-col items-center">
                <span>12m</span>
                <span className="text-[10px]">Strong</span>
              </span>
              <span className="flex flex-col items-center">
                <span>24m</span>
                <span className="text-[10px]">Secure</span>
              </span>
              <span className="flex flex-col items-center">
                <span>60m</span>
                <span className="text-[10px]">Free</span>
              </span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-indigo-200">
            <div className="text-center">
              <p className="text-xs text-indigo-500 mb-1">Mode</p>
              <p className="text-sm font-semibold text-indigo-800">{getModeLabel()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-indigo-500 mb-1">Available Funds</p>
              <p className="text-sm font-semibold text-indigo-800">{formatCurrency(savingsAmount)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-indigo-500 mb-1">Daily Burn</p>
              <p className="text-sm font-semibold text-indigo-800">{formatCurrency(monthlyExpenses / 30)}/day</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <EnhancedRunwayChart 
          savings={savingsAmount} 
          monthlyExpenses={monthlyExpenses} 
          months={displayRunwayMonths}
          incomeEvents={incomeEvents}
          incomeEnabled={incomeEnabled}
        />

        {/* Additional Info */}
        {monthlyExpenses > 0 && (
          <div className="text-sm text-gray-600">
            <p><strong>Monthly Expenses:</strong> {formatCurrency(monthlyExpenses)}</p>
            <p><strong>Daily Burn Rate:</strong> {formatCurrency(monthlyExpenses / 30)}</p>
            {incomeEnabled && incomeEvents.length > 0 && (
              <p className="text-green-600 mt-1">
                <strong>Income Events:</strong> {incomeEvents.length} events configured
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RunwayChart;