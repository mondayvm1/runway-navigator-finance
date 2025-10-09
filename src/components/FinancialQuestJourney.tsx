import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Compass, Shield, TrendingUp, Target, Crown, Zap } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface FinancialQuestJourneyProps {
  netWorth: number;
  runway: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyObligations: number;
  paymentsCleared: number;
  totalPayments: number;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  icon: any;
  isComplete: boolean;
  progress: number;
  reward: string;
  mysticalMessage: string;
}

const FinancialQuestJourney = ({
  netWorth,
  runway,
  totalAssets,
  totalLiabilities,
  monthlyObligations,
  paymentsCleared,
  totalPayments,
}: FinancialQuestJourneyProps) => {
  
  const getQuests = (): Quest[] => {
    const quests: Quest[] = [];
    
    // Quest 1: Clear Monthly Obligations
    const paymentProgress = totalPayments > 0 ? (paymentsCleared / totalPayments) * 100 : 100;
    quests.push({
      id: 'clear-obligations',
      title: 'The Path of Liberation',
      description: `Clear all ${totalPayments} monthly payment obligations`,
      icon: Zap,
      isComplete: paymentsCleared === totalPayments && totalPayments > 0,
      progress: paymentProgress,
      reward: '+50 Wisdom Points',
      mysticalMessage: 'Every payment cleared lightens your burden and strengthens your spirit.',
    });
    
    // Quest 2: Achieve Positive Net Worth
    const netWorthProgress = netWorth > 0 ? 100 : Math.min(((netWorth + Math.abs(totalLiabilities)) / Math.abs(totalLiabilities)) * 100, 99);
    quests.push({
      id: 'positive-worth',
      title: 'Cross the Threshold of Prosperity',
      description: 'Achieve positive net worth',
      icon: TrendingUp,
      isComplete: netWorth > 0,
      progress: netWorth > 0 ? 100 : Math.max(0, netWorthProgress),
      reward: '+100 Wisdom Points',
      mysticalMessage: 'The moment your worth turns positive, you enter the realm of abundance.',
    });
    
    // Quest 3: Build 3-Month Runway
    const threeMonthProgress = Math.min((runway / 3) * 100, 100);
    quests.push({
      id: 'three-month-shield',
      title: 'Forge the Shield of Security',
      description: 'Build a 3-month financial runway',
      icon: Shield,
      isComplete: runway >= 3,
      progress: threeMonthProgress,
      reward: '+150 Wisdom Points',
      mysticalMessage: 'Three months of protection grants you the courage to face uncertainty.',
    });
    
    // Quest 4: Build 6-Month Runway
    const sixMonthProgress = Math.min((runway / 6) * 100, 100);
    quests.push({
      id: 'six-month-fortress',
      title: 'Construct the Fortress of Freedom',
      description: 'Build a 6-month financial runway',
      icon: Target,
      isComplete: runway >= 6,
      progress: sixMonthProgress,
      reward: '+250 Wisdom Points',
      mysticalMessage: 'Six months of runway is the foundation upon which empires are built.',
    });
    
    // Quest 5: Reduce Debt Ratio
    const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) : 1;
    const debtProgress = Math.max(0, (1 - debtRatio) * 100);
    quests.push({
      id: 'debt-slayer',
      title: 'Slay the Dragon of Debt',
      description: 'Reduce debt to less than 30% of assets',
      icon: Compass,
      isComplete: debtRatio < 0.3 && totalAssets > 0,
      progress: Math.min(debtProgress, 100),
      reward: '+200 Wisdom Points',
      mysticalMessage: 'Each debt vanquished brings you closer to true financial freedom.',
    });
    
    // Quest 6: Wealth Builder
    const wealthProgress = Math.min((totalAssets / 100000) * 100, 100);
    quests.push({
      id: 'wealth-master',
      title: 'Ascend to Wealth Mastery',
      description: 'Accumulate $100,000 in total assets',
      icon: Crown,
      isComplete: totalAssets >= 100000,
      progress: wealthProgress,
      reward: '+500 Wisdom Points',
      mysticalMessage: 'The path to mastery is long, but every step forward is a victory.',
    });
    
    return quests;
  };
  
  const quests = getQuests();
  const completedQuests = quests.filter(q => q.isComplete).length;
  const totalQuests = quests.length;
  const journeyProgress = (completedQuests / totalQuests) * 100;
  
  const getJourneyStage = () => {
    if (completedQuests === 0) return { title: 'The Novice', icon: '🌱', color: 'text-slate-600' };
    if (completedQuests === 1) return { title: 'The Seeker', icon: '🔍', color: 'text-blue-600' };
    if (completedQuests === 2) return { title: 'The Warrior', icon: '⚔️', color: 'text-purple-600' };
    if (completedQuests === 3) return { title: 'The Guardian', icon: '🛡️', color: 'text-indigo-600' };
    if (completedQuests === 4) return { title: 'The Sage', icon: '📜', color: 'text-violet-600' };
    if (completedQuests === 5) return { title: 'The Master', icon: '💎', color: 'text-amber-600' };
    return { title: 'The Legend', icon: '👑', color: 'text-yellow-600' };
  };
  
  const stage = getJourneyStage();
  
  return (
    <div className="space-y-6">
        {/* Journey Header */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{stage.icon}</span>
                <h3 className={`text-xl font-bold ${stage.color}`}>{stage.title}</h3>
              </div>
              <p className="text-sm text-slate-600">Your journey to financial mastery</p>
            </div>
            <Badge variant="secondary" className="bg-purple-600 text-white text-lg px-4 py-2">
              {completedQuests}/{totalQuests}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Journey Progress</span>
              <span className="font-semibold text-purple-600">{Math.round(journeyProgress)}%</span>
            </div>
            <Progress value={journeyProgress} className="h-3" />
          </div>
        </Card>
        
        {/* Quest Cards */}
        <div className="space-y-4">
          {quests.map((quest) => (
            <Card
              key={quest.id}
              className={`p-5 transition-all ${
                quest.isComplete
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                  : 'bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      quest.isComplete ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <quest.icon className={`h-5 w-5 ${
                        quest.isComplete ? 'text-green-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 mb-1">{quest.title}</h4>
                      <p className="text-sm text-slate-600 mb-2">{quest.description}</p>
                      <p className="text-xs italic text-slate-500">{quest.mysticalMessage}</p>
                    </div>
                  </div>
                  
                  {quest.isComplete ? (
                    <Badge className="bg-green-600 text-white">Complete ✓</Badge>
                  ) : (
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      In Progress
                    </Badge>
                  )}
                </div>
                
                {!quest.isComplete && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-semibold text-blue-600">{Math.round(quest.progress)}%</span>
                    </div>
                    <Progress value={quest.progress} className="h-2" />
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500">Reward</span>
                  <span className="text-sm font-semibold text-amber-600">{quest.reward}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Mystical Encouragement */}
        <Card className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-900 mb-1">Words of Wisdom</p>
              <p className="text-sm text-purple-700">
                {completedQuests === 0 && "Every master was once a beginner. Your journey starts with a single step."}
                {completedQuests === 1 && "You've taken your first step into a larger world. Keep pushing forward!"}
                {completedQuests === 2 && "Your discipline is showing. The path ahead grows clearer with each quest."}
                {completedQuests === 3 && "You're becoming a force to be reckoned with. Don't stop now!"}
                {completedQuests === 4 && "Few reach this level of mastery. Your wisdom grows with each challenge."}
                {completedQuests === 5 && "You stand among the elite. One more quest until legend status!"}
                {completedQuests === 6 && "You are a legend! Your financial mastery is complete. Teach others your ways."}
              </p>
            </div>
          </div>
        </Card>
    </div>
  );
};

export default FinancialQuestJourney;
