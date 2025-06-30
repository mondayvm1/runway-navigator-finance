
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import { PieChart as PieChartIcon, BarChart3, TrendingUp, Shield, Wallet, AlertTriangle } from 'lucide-react';
import { IncomeEvent } from './IncomeManager';
import { AccountItem } from '@/hooks/useFinancialData';

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

  // Asset allocation data for pie chart
  const assetAllocationData = [
    { name: 'Cash & Savings', value: totalCash, color: '#10b981', icon: '💰' },
    { name: 'Investments', value: totalInvestments, color: '#3b82f6', icon: '📈' },
    { name: 'Other Assets', value: totalOtherAssets, color: '#8b5cf6', icon: '🏠' },
  ].filter(item => item.value > 0);

  // Financial health overview
  const financialHealthData = [
    { 
      name: 'Emergency Fund', 
      current: totalCash, 
      target: emergencyFundTarget,
      color: totalCash >= emergencyFundTarget ? '#10b981' : '#f59e0b'
    },
    { 
      name: 'Annual Income', 
      current: projectedIncome, 
      target: annualExpenses,
      color: projectedIncome >= annualExpenses ? '#10b981' : '#ef4444'
    }
  ];

  // Cash flow breakdown
  const cashFlowData = [
    { category: 'Projected Income', amount: projectedIncome, color: '#10b981' },
    { category: 'Annual Expenses', amount: -annualExpenses, color: '#ef4444' },
    { category: 'Net Cash Flow', amount: projectedIncome - annualExpenses, color: projectedIncome >= annualExpenses ? '#10b981' : '#ef4444' }
  ];

  const chartConfig = {
    cash: { label: 'Cash & Savings', color: '#10b981' },
    investments: { label: 'Investments', color: '#3b82f6' },
    otherAssets: { label: 'Other Assets', color: '#8b5cf6' }
  };

  return (
    <div className="space-y-6">
      {/* Financial Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            <span className="font-medium text-emerald-800">Emergency Buffer</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mb-1">
            {formatCurrency(totalCash)}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-emerald-600">Target: {formatCurrency(emergencyFundTarget)}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              bufferStatus === 'Excellent' ? 'bg-green-100 text-green-700' :
              bufferStatus === 'Good' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {bufferStatus}
            </span>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-800">Runway</span>
          </div>
          <div className="text-2xl font-bold text-blue-700 mb-1">
            {runwayMonths.toFixed(1)} months
          </div>
          <div className="text-sm text-blue-600">
            Based on current cash & expenses
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-purple-800">Net Worth</span>
          </div>
          <div className={`text-2xl font-bold mb-1 ${netWorth >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
            {formatCurrency(netWorth)}
          </div>
          <div className="text-sm text-purple-600">
            Assets - Liabilities
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Allocation Pie Chart */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-800">Asset Allocation</h3>
          </div>
          
          {assetAllocationData.length > 0 ? (
            <div className="h-80">
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
                            <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{data.icon}</span>
                                <span className="font-medium">{data.name}</span>
                              </div>
                              <div className="text-lg font-bold" style={{ color: data.color }}>
                                {formatCurrency(data.value)}
                              </div>
                              <div className="text-sm text-slate-500">
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
            <div className="h-80 flex items-center justify-center text-slate-500">
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
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Cash Flow Analysis */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-800">Annual Cash Flow</h3>
          </div>
          
          <div className="h-80">
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
                          <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                            <div className="font-medium mb-1">{data.category}</div>
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
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Monthly Surplus/Deficit:</span>
                <div className={`font-bold ${(projectedIncome - annualExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency((projectedIncome - annualExpenses) / 12)}
                </div>
              </div>
              <div>
                <span className="text-slate-600">Income Coverage:</span>
                <div className={`font-bold ${projectedIncome >= annualExpenses ? 'text-green-600' : 'text-red-600'}`}>
                  {annualExpenses > 0 ? `${((projectedIncome / annualExpenses) * 100).toFixed(1)}%` : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Financial Insights */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">💡 Financial Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="font-medium text-slate-700">Buffer Analysis:</div>
            <ul className="space-y-1 text-slate-600">
              <li>• Emergency fund covers {(totalCash / monthlyExpenses).toFixed(1)} months</li>
              <li>• Recommended: 6 months ({formatCurrency(emergencyFundTarget)})</li>
              <li>• Status: <span className={`font-medium ${
                bufferStatus === 'Excellent' ? 'text-green-600' :
                bufferStatus === 'Good' ? 'text-yellow-600' : 'text-red-600'
              }`}>{bufferStatus}</span></li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-slate-700">Allocation Insights:</div>
            <ul className="space-y-1 text-slate-600">
              <li>• Cash: {totalAssets > 0 ? ((totalCash / totalAssets) * 100).toFixed(1) : 0}% of assets</li>
              <li>• Investments: {totalAssets > 0 ? ((totalInvestments / totalAssets) * 100).toFixed(1) : 0}% of assets</li>
              <li>• Debt-to-Asset: {totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : 0}%</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FinancialAllocationCharts;
