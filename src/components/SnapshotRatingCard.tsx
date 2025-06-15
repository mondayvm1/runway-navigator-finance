
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface SnapshotData {
  totalAssets: number;
  totalLiabilities: number;
  runway: number;
  monthlyExpenses: number;
  date: string;
  name: string;
  description?: string;
}

interface SnapshotRatingCardProps {
  snapshot: SnapshotData;
}

const SnapshotRatingCard = ({ snapshot }: SnapshotRatingCardProps) => {
  const netWorth = snapshot.totalAssets - snapshot.totalLiabilities;
  
  const calculateFinancialScore = () => {
    let score = 0;
    
    // Net worth score (40 points)
    if (netWorth > 100000) score += 40;
    else if (netWorth > 50000) score += 30;
    else if (netWorth > 10000) score += 20;
    else if (netWorth > 0) score += 10;
    
    // Emergency fund score (30 points)
    if (snapshot.runway >= 6) score += 30;
    else if (snapshot.runway >= 3) score += 20;
    else if (snapshot.runway >= 1) score += 10;
    
    // Debt-to-asset ratio score (30 points)
    if (snapshot.totalAssets > 0) {
      const debtRatio = snapshot.totalLiabilities / snapshot.totalAssets;
      if (debtRatio < 0.2) score += 30;
      else if (debtRatio < 0.4) score += 20;
      else if (debtRatio < 0.6) score += 10;
    }
    
    return Math.min(100, score);
  };

  const getFinancialAdvice = () => {
    const score = calculateFinancialScore();
    const advice = [];
    
    if (netWorth < 0) {
      advice.push({
        type: 'urgent',
        icon: AlertTriangle,
        title: 'Focus on Debt Reduction',
        message: 'Your net worth is negative. Prioritize paying off high-interest debt first.'
      });
    }
    
    if (snapshot.runway < 3) {
      advice.push({
        type: 'warning',
        icon: Target,
        title: 'Build Emergency Fund',
        message: `You only have ${snapshot.runway.toFixed(1)} months of expenses saved. Aim for 3-6 months.`
      });
    }
    
    if (snapshot.totalLiabilities > snapshot.totalAssets * 0.5) {
      advice.push({
        type: 'warning',
        icon: TrendingDown,
        title: 'High Debt Load',
        message: 'Your debt is over 50% of your assets. Consider debt consolidation strategies.'
      });
    }
    
    if (score >= 80) {
      advice.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Excellent Financial Health',
        message: 'Consider increasing investments or exploring new income streams.'
      });
    }
    
    return advice.slice(0, 2); // Limit to 2 pieces of advice
  };

  const score = calculateFinancialScore();
  const advice = getFinancialAdvice();
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-800">{snapshot.name}</h4>
          <p className="text-xs text-gray-500">{new Date(snapshot.date).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getScoreColor(score)} flex items-center gap-1`}>
            <Star className="h-5 w-5" />
            {getScoreGrade(score)}
          </div>
          <div className="text-xs text-gray-600">{score}/100</div>
        </div>
      </div>

      {snapshot.description && (
        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{snapshot.description}</p>
      )}

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Financial Health Score</div>
        <Progress value={score} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-gray-600">Net Worth</div>
          <div className={`font-semibold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netWorth)}
          </div>
        </div>
        <div>
          <div className="text-gray-600">Runway</div>
          <div className="font-semibold">{snapshot.runway.toFixed(1)} months</div>
        </div>
      </div>

      {advice.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Key Recommendations</div>
          {advice.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-start gap-2 text-xs">
                <Icon className={`h-3 w-3 mt-0.5 ${
                  item.type === 'success' ? 'text-green-600' :
                  item.type === 'warning' ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-gray-600">{item.message}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default SnapshotRatingCard;
