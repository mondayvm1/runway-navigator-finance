
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Zap } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { AccountItem } from '@/hooks/useFinancialData';

interface FinancialInsightsProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  runway: { months: number; days: number };
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
  
  const getFinancialHealthScore = () => {
    let score = 0;
    
    // Net worth score (40%)
    if (netWorth > 0) score += 40;
    else if (netWorth > -10000) score += 20;
    
    // Runway score (30%)
    if (runway.months >= 6) score += 30;
    else if (runway.months >= 3) score += 20;
    else if (runway.months >= 1) score += 10;
    
    // Credit utilization score (30%)
    const totalCreditUtilization = creditAccounts.reduce((total, account) => {
      if (account.creditLimit && account.creditLimit > 0) {
        return total + (account.balance / account.creditLimit);
      }
      return total;
    }, 0) / Math.max(creditAccounts.length, 1);
    
    if (totalCreditUtilization < 0.3) score += 30;
    else if (totalCreditUtilization < 0.5) score += 20;
    else if (totalCreditUtilization < 0.7) score += 10;
    
    return Math.min(100, score);
  };

  const getInsights = () => {
    const insights = [];
    
    // Emergency fund check
    const emergencyFundMonths = monthlyExpenses > 0 ? runway.months : 0;
    if (emergencyFundMonths < 3) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Emergency Fund Low',
        description: `You have ${emergencyFundMonths.toFixed(1)} months of expenses saved. Aim for 3-6 months.`,
        priority: 'high'
      });
    } else if (emergencyFundMonths >= 6) {
      insights.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Strong Emergency Fund',
        description: `Excellent! You have ${emergencyFundMonths.toFixed(1)} months of expenses saved.`,
        priority: 'medium'
      });
    }

    // Credit utilization check
    creditAccounts.forEach(account => {
      if (account.creditLimit && account.creditLimit > 0) {
        const utilization = (account.balance / account.creditLimit) * 100;
        if (utilization > 30) {
          insights.push({
            type: 'warning',
            icon: AlertTriangle,
            title: `High Credit Utilization: ${account.name}`,
            description: `${utilization.toFixed(1)}% utilization. Keep below 30% for optimal credit score.`,
            priority: 'medium'
          });
        }
      }
    });

    // Net worth growth opportunity
    if (netWorth > 0 && totalAssets > 0) {
      const assetToLiabilityRatio = totalLiabilities / totalAssets;
      if (assetToLiabilityRatio < 0.3) {
        insights.push({
          type: 'success',
          icon: TrendingUp,
          title: 'Great Asset Position',
          description: 'Your debt-to-asset ratio is excellent. Consider investing more aggressively.',
          priority: 'low'
        });
      }
    }

    // Debt payoff opportunity
    if (totalLiabilities > 0) {
      insights.push({
        type: 'info',
        icon: Target,
        title: 'Debt Optimization',
        description: 'Focus on paying off highest interest rate debts first to save money.',
        priority: 'medium'
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
    });
  };

  const healthScore = getFinancialHealthScore();
  const insights = getInsights();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">Financial Insights</h3>
        </div>

        {/* Health Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Financial Health Score</span>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(healthScore)}`}>
                {healthScore}/100
              </div>
              <div className="text-xs text-gray-600">{getScoreLabel(healthScore)}</div>
            </div>
          </div>
          <Progress value={healthScore} className="h-3" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-xs text-blue-700 mb-1">Assets</div>
            <div className="text-lg font-bold text-blue-800">
              {formatCurrency(totalAssets)}
            </div>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-xs text-red-700 mb-1">Liabilities</div>
            <div className="text-lg font-bold text-red-800">
              {formatCurrency(totalLiabilities)}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Insights & Recommendations</h4>
          {insights.length > 0 ? (
            <div className="space-y-2">
              {insights.slice(0, 3).map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Icon className={`h-4 w-4 mt-0.5 ${
                      insight.type === 'success' ? 'text-green-600' :
                      insight.type === 'warning' ? 'text-yellow-600' :
                      insight.type === 'info' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-800">{insight.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{insight.description}</div>
                    </div>
                    <Badge variant={insight.type === 'warning' ? 'destructive' : 'secondary'} className="text-xs">
                      {insight.priority}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              Great job! No immediate concerns detected.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FinancialInsights;
