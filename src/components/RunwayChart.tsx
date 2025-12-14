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

  // Track which income events are enabled for the chart
  const [enabledIncomeEvents, setEnabledIncomeEvents] = useState<Set<string>>(() => {
    return new Set(incomeEvents.map(e => e.id));
  });

  // Update enabled events when incomeEvents change (new events added)
  const toggleIncomeEvent = (eventId: string) => {
    setEnabledIncomeEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  // Filter income events based on enabled state
  const filteredIncomeEvents = incomeEvents.filter(e => enabledIncomeEvents.has(e.id));

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

  // Calculate runway based on SELECTED categories, not total runway prop
  const savingsAmount = getSavingsAmount();
  const calculatedRunwayMonths = monthlyExpenses > 0 ? savingsAmount / monthlyExpenses : 0;
  // If income is enabled, add the additional months from income
  const displayRunwayMonths = incomeEnabled 
    ? calculatedRunwayMonths + runway.additionalMonthsFromIncome 
    : calculatedRunwayMonths;

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

        {/* Income Events Toggle Section */}
        {incomeEnabled && incomeEvents.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mr-2">📈 Income:</span>
            {incomeEvents.map(event => (
              <Button
                key={event.id}
                variant={enabledIncomeEvents.has(event.id) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleIncomeEvent(event.id)}
                className={enabledIncomeEvents.has(event.id) 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'}
              >
                {event.name} ({formatCurrency(event.amount)}/{event.frequency === 'monthly' ? 'mo' : event.frequency === 'yearly' ? 'yr' : '1x'})
              </Button>
            ))}
          </div>
        )}

        {/* Chart with controlled months */}
        <EnhancedRunwayChart 
          savings={savingsAmount} 
          monthlyExpenses={monthlyExpenses} 
          months={displayRunwayMonths}
          incomeEvents={filteredIncomeEvents}
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

          {/* Stats Row - Dynamic based on slider position */}
          {(() => {
            const creditCardDebt = accountData.credit.reduce((sum, acc) => sum + acc.balance, 0);
            const totalCreditLimit = accountData.credit.reduce((sum, acc) => sum + (acc.creditLimit || 0), 0);
            const availableCredit = Math.max(0, totalCreditLimit - creditCardDebt);
            
            // Calculate projected values at the slider's time horizon
            const calculateProjectedValues = () => {
              let projectedFunds = savingsAmount;
              let projectedCreditDebt = creditCardDebt;
              
              // Process each month up to the visible months
              for (let month = 1; month <= visibleMonths; month++) {
                // Subtract expenses
                projectedFunds -= monthlyExpenses;
                
                // Add income if enabled
                if (incomeEnabled && filteredIncomeEvents.length > 0) {
                  const currentDate = new Date();
                  currentDate.setMonth(currentDate.getMonth() + month);
                  
                  filteredIncomeEvents.forEach(event => {
                    const eventStart = new Date(event.date);
                    const eventEnd = event.endDate ? new Date(event.endDate) : null;
                    
                    // Check if income event is active in this month
                    if (currentDate >= eventStart && (!eventEnd || currentDate <= eventEnd)) {
                      if (event.frequency === 'monthly') {
                        projectedFunds += event.amount;
                      } else if (event.frequency === 'yearly') {
                        const eventMonth = eventStart.getMonth();
                        if (currentDate.getMonth() === eventMonth) {
                          projectedFunds += event.amount;
                        }
                      } else if (event.frequency === 'one-time') {
                        const sameMonth = currentDate.getMonth() === eventStart.getMonth() && 
                                         currentDate.getFullYear() === eventStart.getFullYear();
                        if (sameMonth) {
                          projectedFunds += event.amount;
                        }
                      }
                    }
                  });
                }
              }
              
              return {
                projectedFunds,
                projectedCreditDebt, // Could add payment projections later
                projectedAvailableCredit: Math.max(0, totalCreditLimit - projectedCreditDebt)
              };
            };
            
            const projected = calculateProjectedValues();
            const projectedRunwayFromThatPoint = projected.projectedFunds > 0 && monthlyExpenses > 0 
              ? projected.projectedFunds / monthlyExpenses 
              : 0;
            
            // Status indicator for projected funds
            const getFundsStatus = (funds: number) => {
              if (funds > savingsAmount) return { color: 'text-emerald-600 dark:text-emerald-400', label: '📈 Growing' };
              if (funds > 0) return { color: 'text-amber-600 dark:text-amber-400', label: '📉 Depleting' };
              return { color: 'text-destructive', label: '⚠️ Empty' };
            };
            
            const fundsStatus = getFundsStatus(projected.projectedFunds);
            
            return (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-4 border-t border-primary/20">
                <div className="text-center p-3 bg-gradient-to-b from-primary/10 to-transparent rounded-lg">
                  <p className="text-xs text-primary/80 mb-1 font-medium">⏳ Your Horizon</p>
                  <p className="text-lg font-bold text-foreground">
                    {displayRunwayMonths >= 60 ? '60+' : displayRunwayMonths.toFixed(1)} <span className="text-sm font-normal">mo</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(displayRunwayMonths * 30).toLocaleString()} days
                  </p>
                </div>
                <div className="text-center p-3 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-lg">
                  <p className={`text-xs mb-1 font-medium ${fundsStatus.color}`}>💰 War Chest @ {getEndDate(visibleMonths)}</p>
                  <p className={`text-lg font-bold ${projected.projectedFunds < 0 ? 'text-destructive' : 'text-foreground'}`}>
                    {formatCurrency(projected.projectedFunds)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {projected.projectedFunds > 0 ? `+${projectedRunwayFromThatPoint.toFixed(1)} mo left` : 'Funds depleted'}
                  </p>
                </div>
                <div className="text-center p-3 bg-gradient-to-b from-amber-500/10 to-transparent rounded-lg">
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-1 font-medium">🔥 Total Burn</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(monthlyExpenses * visibleMonths)}</p>
                  <p className="text-xs text-muted-foreground">over {visibleMonths} months</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-b from-destructive/10 to-transparent rounded-lg">
                  <p className="text-xs text-destructive mb-1 font-medium">🐉 The Dragon</p>
                  <p className="text-lg font-bold text-destructive">{formatCurrency(projected.projectedCreditDebt)}</p>
                  <p className="text-xs text-muted-foreground">Credit debt</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-b from-blue-500/10 to-transparent rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-medium">🛡️ Credit Shield</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(projected.projectedAvailableCredit)}</p>
                  <p className="text-xs text-muted-foreground">of {formatCurrency(totalCreditLimit)}</p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </Card>
  );
};

export default RunwayChart;