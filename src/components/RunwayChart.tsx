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
  const [selectedMode, setSelectedMode] = useState<'cash' | 'all' | 'net'>('cash');

  // Calculate different savings amounts based on mode
  const getSavingsAmount = () => {
    switch (selectedMode) {
      case 'cash':
        return accountData.cash.reduce((sum, account) => sum + account.balance, 0);
      case 'all':
        return getTotalAssets();
      case 'net':
        return getTotalAssets() - getTotalLiabilities();
      default:
        return 0;
    }
  };

  // Choose which runway number to display based on income toggle
  const displayRunwayMonths = incomeEnabled ? runway.withIncomeMonths : runway.months;

  const savingsAmount = getSavingsAmount();

  const getModeLabel = () => {
    switch (selectedMode) {
      case 'cash':
        return 'Cash Only';
      case 'all':
        return 'All Assets';
      case 'net':
        return 'Net Worth';
      default:
        return 'Cash Only';
    }
  };

  const getModeDescription = () => {
    switch (selectedMode) {
      case 'cash':
        return 'Using only cash accounts for runway calculation';
      case 'all':
        return 'Using all assets (cash + investments + other assets) for runway calculation';
      case 'net':
        return 'Using net worth (assets minus liabilities) for runway calculation';
      default:
        return '';
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-700">Financial Runway Chart</h3>
          <div className="flex gap-2">
            <Button
              variant={selectedMode === 'cash' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMode('cash')}
            >
              Cash Only
            </Button>
            <Button
              variant={selectedMode === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMode('all')}
            >
              All Assets
            </Button>
            <Button
              variant={selectedMode === 'net' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMode('net')}
            >
              Net Worth
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