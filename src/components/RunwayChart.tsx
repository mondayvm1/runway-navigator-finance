import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EnhancedRunwayChart from './EnhancedRunwayChart';
import { IncomeEvent } from './IncomeManager';
import { AccountItem } from '@/hooks/useFinancialData';
import { formatCurrency } from '@/utils/formatters';

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
    netWorth: boolean;
  }>({
    cash: true,
    investments: false,
    otherAssets: false,
    netWorth: false,
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
    
    // If net worth is selected, subtract liabilities
    if (selectedCategories.netWorth) {
      total -= getTotalLiabilities();
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
    if (selectedCategories.netWorth) return 'Net Worth (with liabilities)';
    
    return active.length > 0 ? active.join(' + ') : 'None Selected';
  };

  const getModeDescription = () => {
    const active = [];
    if (selectedCategories.cash) active.push('cash accounts');
    if (selectedCategories.investments) active.push('investments');
    if (selectedCategories.otherAssets) active.push('other assets');
    
    if (selectedCategories.netWorth) {
      return 'Using selected assets minus all liabilities for runway calculation';
    }
    
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
            <Button
              variant={selectedCategories.netWorth ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleCategory('netWorth')}
            >
              - Liabilities
            </Button>
          </div>
        </div>

        {/* Current Mode Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Mode</p>
              <p className="text-lg font-semibold text-gray-900">{getModeLabel()}</p>
              <p className="text-xs text-gray-500">{getModeDescription()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Funds</p>
              <p className="text-lg font-semibold text-blue-700">{formatCurrency(savingsAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Runway (Months)</p>
              <p className="text-lg font-semibold text-green-700">
                {displayRunwayMonths >= 60 ? '60+' : displayRunwayMonths.toFixed(1)}
              </p>
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