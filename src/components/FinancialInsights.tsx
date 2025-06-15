
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { AccountItem } from '@/hooks/useFinancialData';

interface FinancialInsightsProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  runway: {
    days: number;
    months: number;
    withIncomeMonths: number;
    additionalMonthsFromIncome: number;
  };
  creditAccounts: AccountItem[];
  monthlyExpenses: number;
}

const FinancialInsights = ({ 
  netWorth, 
  totalAssets, 
  totalLiabilities, 
  runway, 
  creditAccounts, 
  monthlyExpenses 
}: FinancialInsightsProps) => {
  const getNetWorthStatus = () => {
    if (netWorth > 100000) return { status: 'excellent', icon: CheckCircle, color: 'text-green-600' };
    if (netWorth > 50000) return { status: 'good', icon: TrendingUp, color: 'text-blue-600' };
    if (netWorth > 0) return { status: 'fair', icon: Calendar, color: 'text-yellow-600' };
    return { status: 'needs attention', icon: AlertTriangle, color: 'text-red-600' };
  };

  const getRunwayStatus = () => {
    const effectiveRunway = runway.withIncomeMonths > 0 ? runway.withIncomeMonths : runway.months;
    
    if (effectiveRunway >= 12) return { status: 'excellent', icon: CheckCircle, color: 'text-green-600' };
    if (effectiveRunway >= 6) return { status: 'good', icon: TrendingUp, color: 'text-blue-600' };
    if (effectiveRunway >= 3) return { status: 'fair', icon: Calendar, color: 'text-yellow-600' };
    return { status: 'critical', icon: AlertTriangle, color: 'text-red-600' };
  };

  const getCreditUtilization = () => {
    const totalCreditUsed = creditAccounts.reduce((sum, account) => sum + account.balance, 0);
    const totalCreditLimit = creditAccounts.reduce((sum, account) => sum + (account.creditLimit || 0), 0);
    
    if (totalCreditLimit === 0) return 0;
    return (totalCreditUsed / totalCreditLimit) * 100;
  };

  const creditUtilization = getCreditUtilization();
  const netWorthStatus = getNetWorthStatus();
  const runwayStatus = getRunwayStatus();
  const NetWorthIcon = netWorthStatus.icon;
  const RunwayIcon = runwayStatus.icon;

  const insights = [
    {
      title: 'Net Worth Status',
      value: formatCurrency(netWorth),
      status: netWorthStatus.status,
      icon: NetWorthIcon,
      color: netWorthStatus.color,
      description: netWorth > 0 ? 'Your assets exceed your liabilities' : 'Focus on reducing debt and building assets'
    },
    {
      title: 'Financial Runway',
      value: runway.withIncomeMonths > 0 
        ? `${runway.withIncomeMonths >= 60 ? '60+' : runway.withIncomeMonths} months (with income)`
        : `${runway.months} months`,
      status: runwayStatus.status,
      icon: RunwayIcon,
      color: runwayStatus.color,
      description: runway.additionalMonthsFromIncome > 0 
        ? `Income planning extends runway by ${runway.additionalMonthsFromIncome.toFixed(1)} months`
        : runway.months > 0 
          ? 'Time your savings will last at current expenses'
          : 'Add cash or reduce expenses to build runway'
    },
    {
      title: 'Credit Utilization',
      value: `${creditUtilization.toFixed(1)}%`,
      status: creditUtilization < 30 ? 'good' : creditUtilization < 70 ? 'fair' : 'high',
      icon: creditUtilization < 30 ? CheckCircle : creditUtilization < 70 ? Calendar : AlertTriangle,
      color: creditUtilization < 30 ? 'text-green-600' : creditUtilization < 70 ? 'text-yellow-600' : 'text-red-600',
      description: creditUtilization < 30 ? 'Healthy credit utilization' : 'Consider paying down credit balances'
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Insights</h3>
      
      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-800 text-sm">{insight.title}</h4>
                  <span className="font-semibold text-gray-900">{insight.value}</span>
                </div>
                <p className="text-xs text-gray-600">{insight.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Income Impact Summary */}
      {runway.additionalMonthsFromIncome > 0 && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-800 text-sm">Income Impact</span>
          </div>
          <p className="text-xs text-green-700">
            Your planned income events extend your financial runway by{' '}
            <span className="font-semibold">
              {runway.additionalMonthsFromIncome >= 60 ? '60+' : runway.additionalMonthsFromIncome.toFixed(1)} months
            </span>
            , providing significant additional financial security.
          </p>
        </div>
      )}
    </Card>
  );
};

export default FinancialInsights;
