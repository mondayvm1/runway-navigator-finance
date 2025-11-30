import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Award, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { AccountItem } from '@/hooks/useFinancialData';
import CollapsibleSection from './CollapsibleSection';

interface CreditScoreEstimatorProps {
  creditAccounts: AccountItem[];
}

const CreditScoreEstimator = ({ creditAccounts }: CreditScoreEstimatorProps) => {
  // Calculate credit utilization
  const totalBalance = creditAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLimit = creditAccounts.reduce((sum, acc) => sum + (acc.creditLimit || 0), 0);
  const overallUtilization = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;

  // Count accounts with balances
  const accountsWithBalance = creditAccounts.filter(acc => acc.balance > 0).length;
  const totalAccounts = creditAccounts.length;

  // Estimate credit score based on factors
  const estimateCreditScore = () => {
    let score = 850; // Start with perfect score

    // Payment History (35% of score) - We assume good if they're tracking
    // No data to determine missed payments, so we give benefit of doubt
    const paymentHistoryScore = 297; // Assume good payment history

    // Amounts Owed / Credit Utilization (30% of score)
    let utilizationScore = 255; // Max for this category
    if (overallUtilization > 90) {
      utilizationScore = 50; // Very poor
    } else if (overallUtilization > 70) {
      utilizationScore = 100; // Poor
    } else if (overallUtilization > 50) {
      utilizationScore = 150; // Fair
    } else if (overallUtilization > 30) {
      utilizationScore = 200; // Good
    } else if (overallUtilization > 10) {
      utilizationScore = 240; // Very Good
    }
    // else excellent (< 10%)

    // Length of Credit History (15% of score) - We don't have this data
    const creditHistoryScore = 100; // Assume moderate history

    // Credit Mix (10% of score) - Based on number of accounts
    let creditMixScore = 85;
    if (totalAccounts >= 5) creditMixScore = 85;
    else if (totalAccounts >= 3) creditMixScore = 60;
    else if (totalAccounts >= 1) creditMixScore = 40;
    else creditMixScore = 0;

    // New Credit (10% of score) - We assume no recent inquiries
    const newCreditScore = 85;

    const estimatedScore = Math.round(
      paymentHistoryScore + utilizationScore + creditHistoryScore + creditMixScore + newCreditScore
    );

    return Math.min(850, Math.max(300, estimatedScore));
  };

  const estimatedScore = estimateCreditScore();

  // Score ranges and colors
  const getScoreCategory = (score: number) => {
    if (score >= 800) return { label: 'Exceptional', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (score >= 740) return { label: 'Very Good', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (score >= 670) return { label: 'Good', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' };
    if (score >= 580) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const scoreCategory = getScoreCategory(estimatedScore);

  // Calculate impact of improvements
  const calculateUtilizationImpact = () => {
    if (overallUtilization <= 10) return null;
    
    const targetUtilization = Math.max(0, Math.min(10, overallUtilization - 20));
    const targetBalance = (targetUtilization / 100) * totalLimit;
    const payoffAmount = totalBalance - targetBalance;
    
    let scoreIncrease = 0;
    if (overallUtilization > 70) scoreIncrease = 50;
    else if (overallUtilization > 50) scoreIncrease = 40;
    else if (overallUtilization > 30) scoreIncrease = 30;
    else scoreIncrease = 20;

    return { payoffAmount, scoreIncrease, targetUtilization };
  };

  const utilizationImpact = calculateUtilizationImpact();

  if (creditAccounts.length === 0) {
    return null;
  }

  return (
    <CollapsibleSection
      title="Credit Score Estimator"
      category="credit-score"
      icon={<Award className="h-5 w-5 text-blue-500" />}
      defaultOpen={true}
    >
      <div className="space-y-6">
        {/* Estimated Score */}
        <Card className={`p-6 ${scoreCategory.bg} border-2 ${scoreCategory.border}`}>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Estimated Credit Score</p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <Award className={`h-8 w-8 ${scoreCategory.color}`} />
              <p className={`text-6xl font-bold ${scoreCategory.color}`}>{estimatedScore}</p>
            </div>
            <p className={`text-xl font-semibold ${scoreCategory.color} mb-2`}>{scoreCategory.label}</p>
            <p className="text-xs text-gray-500">Score range: 300-850</p>
          </div>

          {/* Score Breakdown Bar */}
          <div className="mt-6">
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-[20%] bg-red-500" />
              <div className="absolute inset-y-0 left-[20%] w-[16.4%] bg-orange-500" />
              <div className="absolute inset-y-0 left-[36.4%] w-[12.7%] bg-yellow-500" />
              <div className="absolute inset-y-0 left-[49.1%] w-[29.1%] bg-blue-500" />
              <div className="absolute inset-y-0 left-[78.2%] w-[21.8%] bg-green-500" />
              
              {/* Score marker */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-black"
                style={{ left: `${((estimatedScore - 300) / 550) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>300</span>
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Exceptional</span>
              <span>850</span>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-600 bg-white/50 p-3 rounded">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            This is an estimate based on your credit utilization. Actual scores consider payment history, credit age, credit mix, and recent inquiries.
          </div>
        </Card>

        {/* Score Factors */}
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">What Affects Your Score</h4>
          
          <div className="space-y-4">
            {/* Payment History */}
            <div className="flex items-start justify-between pb-3 border-b">
              <div>
                <p className="font-medium text-gray-800">Payment History</p>
                <p className="text-sm text-gray-600">Most important factor (35%)</p>
              </div>
              <div className="text-right">
                <Minus className="h-5 w-5 text-gray-400 ml-auto mb-1" />
                <p className="text-xs text-gray-500">No data</p>
              </div>
            </div>

            {/* Credit Utilization */}
            <div className="flex items-start justify-between pb-3 border-b">
              <div>
                <p className="font-medium text-gray-800">Credit Utilization</p>
                <p className="text-sm text-gray-600">Very important (30%)</p>
                <p className="text-xs text-gray-500 mt-1">Current: {overallUtilization.toFixed(1)}%</p>
              </div>
              <div className="text-right">
                {overallUtilization <= 10 ? (
                  <TrendingUp className="h-5 w-5 text-green-500 ml-auto mb-1" />
                ) : overallUtilization <= 30 ? (
                  <Minus className="h-5 w-5 text-blue-500 ml-auto mb-1" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500 ml-auto mb-1" />
                )}
                <p className={`text-xs font-semibold ${
                  overallUtilization <= 10 ? 'text-green-600' : 
                  overallUtilization <= 30 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {overallUtilization <= 10 ? 'Excellent' : 
                   overallUtilization <= 30 ? 'Good' : 'Poor'}
                </p>
              </div>
            </div>

            {/* Credit History Length */}
            <div className="flex items-start justify-between pb-3 border-b">
              <div>
                <p className="font-medium text-gray-800">Length of Credit History</p>
                <p className="text-sm text-gray-600">Important (15%)</p>
              </div>
              <div className="text-right">
                <Minus className="h-5 w-5 text-gray-400 ml-auto mb-1" />
                <p className="text-xs text-gray-500">No data</p>
              </div>
            </div>

            {/* Credit Mix */}
            <div className="flex items-start justify-between pb-3 border-b">
              <div>
                <p className="font-medium text-gray-800">Credit Mix</p>
                <p className="text-sm text-gray-600">Moderate impact (10%)</p>
                <p className="text-xs text-gray-500 mt-1">{totalAccounts} credit account{totalAccounts !== 1 ? 's' : ''}</p>
              </div>
              <div className="text-right">
                {totalAccounts >= 3 ? (
                  <TrendingUp className="h-5 w-5 text-green-500 ml-auto mb-1" />
                ) : totalAccounts >= 1 ? (
                  <Minus className="h-5 w-5 text-blue-500 ml-auto mb-1" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-gray-400 ml-auto mb-1" />
                )}
                <p className="text-xs text-gray-500">
                  {totalAccounts >= 3 ? 'Good' : totalAccounts >= 1 ? 'Fair' : 'None'}
                </p>
              </div>
            </div>

            {/* New Credit */}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-800">New Credit Inquiries</p>
                <p className="text-sm text-gray-600">Small impact (10%)</p>
              </div>
              <div className="text-right">
                <Minus className="h-5 w-5 text-gray-400 ml-auto mb-1" />
                <p className="text-xs text-gray-500">No data</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Improvement Tips */}
        {utilizationImpact && (
          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Score Boost
            </h4>
            <p className="text-sm text-emerald-800 mb-3">
              Pay down {formatCurrency(utilizationImpact.payoffAmount)} to reduce your utilization to {utilizationImpact.targetUtilization.toFixed(1)}%
            </p>
            <div className="bg-white/70 p-4 rounded border border-emerald-200">
              <p className="text-lg font-bold text-emerald-700">
                Potential Score Increase: +{utilizationImpact.scoreIncrease} points
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Lower utilization = higher score. Keep it under 30%, ideally under 10%.
              </p>
            </div>
          </Card>
        )}

        {/* Additional Tips */}
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2 text-sm">Tips to Improve Your Score</h4>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>Pay all bills on time, every time</li>
            <li>Keep credit utilization below 30% (ideally under 10%)</li>
            <li>Don't close old credit cards (length of history matters)</li>
            <li>Limit new credit applications</li>
            <li>Check your credit report for errors annually</li>
            <li>Consider becoming an authorized user on a good account</li>
          </ul>
        </Card>
      </div>
    </CollapsibleSection>
  );
};

export default CreditScoreEstimator;
