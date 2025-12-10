import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import EnhancedRunwayChart from './EnhancedRunwayChart';
import { IncomeEvent } from './IncomeManager';
import { AccountItem } from '@/hooks/useFinancialData';
import { formatCurrency } from '@/utils/formatters';
import { Calendar } from 'lucide-react';

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

  const [visibleMonths, setVisibleMonths] = useState(12);

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

  // Choose which runway number to display based on income toggle
  const displayRunwayMonths = incomeEnabled ? runway.withIncomeMonths : runway.months;
  const savingsAmount = getSavingsAmount();

  // Calculate end date based on slider
  const getEndDate = (months: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Get milestone label for current position
  const getMilestoneLabel = (months: number) => {
    if (months <= 3) return 'Emergency Fund';
    if (months <= 6) return 'Stable';
    if (months <= 12) return 'Strong';
    if (months <= 24) return 'Secure';
    if (months <= 36) return 'Very Secure';
    if (months <= 48) return 'Excellent';
    return 'Financial Freedom';
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground/80">Financial Runway Chart</h3>
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

        {/* Chart with controlled months */}
        <EnhancedRunwayChart 
          savings={savingsAmount} 
          monthlyExpenses={monthlyExpenses} 
          months={displayRunwayMonths}
          incomeEvents={incomeEvents}
          incomeEnabled={incomeEnabled}
          visibleMonths={visibleMonths}
        />

        {/* Interactive Timeline Slider */}
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6 rounded-xl border-2 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Timeline Range</h4>
                <p className="text-xs text-muted-foreground">Slide to see further into the future</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{getEndDate(visibleMonths)}</p>
              <p className="text-xs text-muted-foreground">{visibleMonths} months • {getMilestoneLabel(visibleMonths)}</p>
            </div>
          </div>
          
          {/* Interactive Slider */}
          <div className="space-y-3">
            <Slider
              value={[visibleMonths]}
              min={6}
              max={60}
              step={1}
              onValueChange={(value) => setVisibleMonths(value[0])}
              className="cursor-pointer [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:shadow-lg hover:[&_[role=slider]]:scale-110 [&_[role=slider]]:transition-transform"
            />
            
            {/* Timeline markers */}
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span className="flex flex-col items-center">
                <span className="font-medium">6m</span>
              </span>
              <span className="flex flex-col items-center">
                <span className="font-medium">1yr</span>
              </span>
              <span className="flex flex-col items-center">
                <span className="font-medium">2yr</span>
              </span>
              <span className="flex flex-col items-center">
                <span className="font-medium">3yr</span>
              </span>
              <span className="flex flex-col items-center">
                <span className="font-medium">4yr</span>
              </span>
              <span className="flex flex-col items-center">
                <span className="font-medium">5yr</span>
              </span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-primary/20">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Runway</p>
              <p className="text-sm font-semibold text-foreground">
                {displayRunwayMonths >= 60 ? '60+' : displayRunwayMonths.toFixed(1)} months
              </p>
              <p className="text-xs text-muted-foreground">
                ({Math.round(displayRunwayMonths * 30)} days)
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Available Funds</p>
              <p className="text-sm font-semibold text-foreground">{formatCurrency(savingsAmount)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Monthly Burn</p>
              <p className="text-sm font-semibold text-foreground">{formatCurrency(monthlyExpenses)}</p>
              <p className="text-xs text-muted-foreground">
                ({formatCurrency(monthlyExpenses / 30)}/day)
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Credit Card Debt</p>
              <p className="text-sm font-semibold text-destructive">
                {formatCurrency(accountData.credit.reduce((sum, acc) => sum + acc.balance, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RunwayChart;