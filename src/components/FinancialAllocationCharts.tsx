import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import { PieChart as PieChartIcon, BarChart3, TrendingUp, Shield, Wallet, AlertTriangle, CalendarDays } from 'lucide-react';
import { IncomeEvent } from './IncomeManager';
import { AccountItem } from '@/hooks/useFinancialData';
import CollapsibleSection from './CollapsibleSection';

interface FinancialAllocationChartsProps {
  accountData: {
    cash: AccountItem[];
    investments: AccountItem[];
    credit: AccountItem[];
    loans: AccountItem[];
    otherAssets: AccountItem[];
  };
  monthlyExpenses: number;
  incomeEvents: IncomeEvent[];
  incomeEnabled: boolean;
}

// Color palette matching CollapsibleSection
const palette = {
  primary: '#2563eb',    // blue-600
  secondary: '#a78bfa',  // purple-400
  tertiary: '#c7d2fe',   // indigo-200
  border: '#c7d2fe',     // indigo-200
  text: '#1e293b',       // slate-800
  background: '#FFFFFF', // White for contrast
};

const FinancialAllocationCharts = ({
  accountData,
  monthlyExpenses,
  incomeEvents,
  incomeEnabled
}: FinancialAllocationChartsProps) => {
  
  // Calculate totals
  const totalCash = accountData.cash.reduce((sum, account) => sum + account.balance, 0);
  const totalInvestments = accountData.investments.reduce((sum, account) => sum + account.balance, 0);
  const totalCredit = accountData.credit.reduce((sum, account) => sum + account.balance, 0);
  const totalLoans = accountData.loans.reduce((sum, account) => sum + account.balance, 0);
  const totalOtherAssets = accountData.otherAssets.reduce((sum, account) => sum + account.balance, 0);
  
  const totalAssets = totalCash + totalInvestments + totalOtherAssets;
  const totalLiabilities = totalCredit + totalLoans;
  const netWorth = totalAssets - totalLiabilities;

  // Calculate projected income for next 12 months
  const getProjectedIncome = () => {
    if (!incomeEnabled) return 0;
    
    const now = new Date();
    return incomeEvents.reduce((total, event) => {
      const eventDate = new Date(event.date);
      if (eventDate < now) return total;
      
      if (event.frequency === 'one-time') {
        return total + event.amount;
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

  const projectedIncome = getProjectedIncome();
  const annualExpenses = monthlyExpenses * 12;
  const runwayMonths = totalCash > 0 && monthlyExpenses > 0 ? totalCash / monthlyExpenses : 0;
  
  // Buffer analysis
  const emergencyFundTarget = monthlyExpenses * 6; // 6 months emergency fund
  const bufferStatus = totalCash >= emergencyFundTarget ? 'Excellent' : 
                      totalCash >= monthlyExpenses * 3 ? 'Good' : 'Needs Attention';

  // Asset allocation data for pie chart with new colors
  const assetAllocationData = [
    { name: 'Cash & Savings', value: totalCash, color: palette.primary, icon: '💰' },
    { name: 'Investments', value: totalInvestments, color: palette.secondary, icon: '📈' },
    { name: 'Other Assets', value: totalOtherAssets, color: palette.tertiary, icon: '🏠' },
  ].filter(item => item.value > 0);

  // Financial health overview
  const financialHealthData = [
    { 
      name: 'Emergency Fund', 
      current: totalCash, 
      target: emergencyFundTarget,
      color: totalCash >= emergencyFundTarget ? palette.primary : palette.secondary
    },
    { 
      name: 'Annual Income', 
      current: projectedIncome, 
      target: annualExpenses,
      color: projectedIncome >= annualExpenses ? palette.primary : palette.text
    }
  ];

  // Cash flow breakdown with new colors
  const annualCashFlow = projectedIncome - annualExpenses;
  
  const cashFlowData = [
    { category: 'Projected Income', amount: projectedIncome, color: palette.primary },
    { category: 'Annual Expenses', amount: annualExpenses, color: palette.secondary },
    { category: 'Net Cash Flow', amount: Math.abs(annualCashFlow), color: annualCashFlow >= 0 ? palette.primary : palette.text }
  ];

  const chartConfig = {
    cash: { label: 'Cash & Savings', color: palette.primary },
    investments: { label: 'Investments', color: palette.secondary },
    otherAssets: { label: 'Other Assets', color: palette.tertiary }
  };

  return (
    <CollapsibleSection
      title="Financial Allocation & Analysis"
      category="financial-allocation"
      icon={<PieChartIcon className="h-5 w-5" style={{ color: palette.primary }} />}
      defaultOpen={false}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Financial Health Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card 
            className="p-3 sm:p-4 border-2" 
            style={{ 
              backgroundColor: palette.primary, 
              borderColor: palette.border,
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: palette.text }} />
              <span className="font-medium text-xs sm:text-sm" style={{ color: palette.text }}>Emergency</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1 truncate" style={{ color: palette.text }}>
              {formatCurrency(totalCash)}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[10px] sm:text-sm gap-1">
              <span className="hidden sm:inline" style={{ color: palette.text }}>Target: {formatCurrency(emergencyFundTarget)}</span>
              <span 
                className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium self-start"
                style={{ 
                  color: palette.text,
                  backgroundColor: bufferStatus === 'Excellent' ? palette.secondary : 
                                 bufferStatus === 'Good' ? palette.tertiary : palette.border 
                }}
              >
                {bufferStatus}
              </span>
            </div>
          </Card>

          <Card 
            className="p-3 sm:p-4 border-2" 
            style={{ 
              backgroundColor: palette.secondary, 
              borderColor: palette.border,
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: palette.text }} />
              <span className="font-medium text-xs sm:text-sm" style={{ color: palette.text }}>Runway</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1" style={{ color: palette.text }}>
              {runwayMonths.toFixed(1)}mo
            </div>
            <div className="text-[10px] sm:text-sm hidden sm:block" style={{ color: palette.text }}>
              Based on current cash
            </div>
          </Card>

          <Card 
            className="p-3 sm:p-4 border-2" 
            style={{ 
              backgroundColor: palette.tertiary, 
              borderColor: palette.border,
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <Wallet className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: palette.text }} />
              <span className="font-medium text-xs sm:text-sm" style={{ color: palette.text }}>Net Worth</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1 truncate" style={{ color: palette.text }}>
              {formatCurrency(netWorth)}
            </div>
            <div className="text-[10px] sm:text-sm hidden sm:block" style={{ color: palette.text }}>
              Assets - Liabilities
            </div>
          </Card>

          <Card 
            className="p-3 sm:p-4 border-2" 
            style={{ 
              backgroundColor: annualCashFlow >= 0 ? palette.primary : '#fecaca',
              borderColor: palette.border,
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: palette.text }} />
              <span className="font-medium text-xs sm:text-sm" style={{ color: palette.text }}>Cashflow</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1 truncate" style={{ color: palette.text }}>
              {formatCurrency(annualCashFlow)}
            </div>
            <div className="text-[10px] sm:text-sm" style={{ color: palette.text }}>
              {annualCashFlow >= 0 ? 'Surplus' : 'Deficit'}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Allocation Pie Chart */}
          <Card className="p-6 border-2" style={{ borderColor: palette.border, backgroundColor: palette.background }}>
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="h-5 w-5" style={{ color: palette.text }} />
              <h3 className="text-lg font-semibold" style={{ color: palette.text }}>Asset Allocation</h3>
            </div>
            
            {assetAllocationData.length > 0 ? (
              <div className="h-64 sm:h-80">
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetAllocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {assetAllocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div 
                                className="p-3 border rounded-lg shadow-lg" 
                                style={{ 
                                  backgroundColor: palette.background, 
                                  borderColor: palette.border 
                                }}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">{data.icon}</span>
                                  <span className="font-medium" style={{ color: palette.text }}>
                                    {data.name}
                                  </span>
                                </div>
                                <div className="text-lg font-bold" style={{ color: data.color }}>
                                  {formatCurrency(data.value)}
                                </div>
                                <div className="text-sm" style={{ color: palette.text }}>
                                  {((data.value / totalAssets) * 100).toFixed(1)}% of total assets
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center" style={{ color: palette.text }}>
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                  <p>No assets to display</p>
                  <p className="text-sm">Add your accounts to see allocation</p>
                </div>
              </div>
            )}
            
            {/* Asset Legend */}
            {assetAllocationData.length > 0 && (
              <div className="mt-4 space-y-2">
                {assetAllocationData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium" style={{ color: palette.text }}>
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: palette.text }}>
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Cash Flow Analysis */}
          <Card className="p-6 border-2" style={{ borderColor: palette.border, backgroundColor: palette.background }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5" style={{ color: palette.text }} />
              <h3 className="text-lg font-semibold" style={{ color: palette.text }}>Annual Cash Flow</h3>
            </div>
            
            <div className="h-64 sm:h-80">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlowData} layout="horizontal">
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(Math.abs(value))} />
                    <YAxis dataKey="category" type="category" width={100} />
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div 
                              className="p-3 border rounded-lg shadow-lg" 
                              style={{ 
                                backgroundColor: palette.background, 
                                borderColor: palette.border 
                              }}
                            >
                              <div className="font-medium mb-1" style={{ color: palette.text }}>
                                {data.category}
                              </div>
                              <div className="text-lg font-bold" style={{ color: data.color }}>
                                {formatCurrency(data.amount)}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="amount">
                      {cashFlowData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Cash Flow Summary */}
            <div 
              className="mt-4 p-4 rounded-lg border-2" 
              style={{ 
                backgroundColor: palette.tertiary, 
                borderColor: palette.border 
              }}
            >
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span style={{ color: palette.text }}>Monthly Surplus/Deficit:</span>
                  <div className="font-bold" style={{ color: palette.text }}>
                    {formatCurrency((projectedIncome - annualExpenses) / 12)}
                  </div>
                </div>
                <div>
                  <span style={{ color: palette.text }}>Income Coverage:</span>
                  <div className="font-bold" style={{ color: palette.text }}>
                    {annualExpenses > 0 ? `${((projectedIncome / annualExpenses) * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Financial Insights */}
        <Card 
          className="p-6 border-2" 
          style={{ 
            backgroundColor: palette.tertiary, 
            borderColor: palette.border 
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: palette.text }}>
            💡 Financial Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-medium" style={{ color: palette.text }}>Buffer Analysis:</div>
              <ul className="space-y-1" style={{ color: palette.text }}>
                <li>• Emergency fund covers {(totalCash / monthlyExpenses).toFixed(1)} months</li>
                <li>• Recommended: 6 months ({formatCurrency(emergencyFundTarget)})</li>
                <li>• Status: <span className="font-medium">{bufferStatus}</span></li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="font-medium" style={{ color: palette.text }}>Allocation Insights:</div>
              <ul className="space-y-1" style={{ color: palette.text }}>
                <li>• Cash: {totalAssets > 0 ? ((totalCash / totalAssets) * 100).toFixed(1) : 0}% of assets</li>
                <li>• Investments: {totalAssets > 0 ? ((totalInvestments / totalAssets) * 100).toFixed(1) : 0}% of assets</li>
                <li>• Debt-to-Asset: {totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : 0}%</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </CollapsibleSection>
  );
};

export default FinancialAllocationCharts;
