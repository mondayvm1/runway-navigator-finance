
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, TrendingUp, Target, Zap, Award } from 'lucide-react';

interface GamificationCardProps {
  netWorth: number;
  runway: number;
  snapshotCount: number;
  totalAssets: number;
}

const GamificationCard = ({ netWorth, runway, snapshotCount, totalAssets }: GamificationCardProps) => {
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [rank, setRank] = useState('Beginner');

  useEffect(() => {
    calculatePoints();
  }, [netWorth, runway, snapshotCount, totalAssets]);

  const calculatePoints = () => {
    let totalPoints = 0;
    
    // Points for positive net worth
    if (netWorth > 0) totalPoints += Math.min(netWorth / 1000, 100);
    
    // Points for runway length
    if (runway > 0) totalPoints += Math.min(runway * 10, 120);
    
    // Points for tracking (snapshots)
    totalPoints += snapshotCount * 25;
    
    // Points for asset diversification
    if (totalAssets > 10000) totalPoints += 50;
    if (totalAssets > 50000) totalPoints += 100;
    if (totalAssets > 100000) totalPoints += 200;
    
    // Calculate level (every 100 points = new level)
    const newLevel = Math.floor(totalPoints / 100) + 1;
    
    // Determine rank
    let newRank = 'Beginner';
    if (totalPoints >= 500) newRank = 'Money Master';
    else if (totalPoints >= 300) newRank = 'Financial Guru';
    else if (totalPoints >= 200) newRank = 'Budget Pro';
    else if (totalPoints >= 100) newRank = 'Saver';
    else if (totalPoints >= 50) newRank = 'Starter';
    
    setPoints(Math.round(totalPoints));
    setLevel(newLevel);
    setRank(newRank);
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "Every dollar saved is a step towards freedom! 🚀",
      "Your future self will thank you for tracking today! 💪",
      "Compound interest is the eighth wonder of the world! ⚡",
      "You're building wealth one snapshot at a time! 🏗️",
      "Financial awareness is the first step to wealth! 🎯",
      "Small steps lead to big financial wins! 🏆",
      "You're mastering money like a pro! 💎",
      "Consistency beats perfection in finance! 🔥"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const getAchievements = () => {
    const achievements = [];
    
    if (netWorth > 0) achievements.push({ icon: TrendingUp, text: "Positive Net Worth", color: "bg-green-500" });
    if (runway >= 6) achievements.push({ icon: Target, text: "6+ Month Runway", color: "bg-blue-500" });
    if (snapshotCount >= 3) achievements.push({ icon: Star, text: "Consistent Tracker", color: "bg-purple-500" });
    if (totalAssets >= 50000) achievements.push({ icon: Award, text: "Wealth Builder", color: "bg-yellow-500" });
    
    return achievements;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-800">Financial Mastery</h3>
        </div>
        <Badge variant="secondary" className="bg-blue-600 text-white">
          Level {level}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{points}</div>
          <div className="text-sm text-gray-600">Points</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-purple-600">{rank}</div>
          <div className="text-sm text-gray-600">Rank</div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">Achievements</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {getAchievements().map((achievement, index) => (
            <Badge key={index} variant="secondary" className={`${achievement.color} text-white text-xs`}>
              <achievement.icon className="h-3 w-3 mr-1" />
              {achievement.text}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="p-3 bg-white rounded-lg border border-blue-200">
        <div className="text-sm font-medium text-gray-800 mb-1">💡 Daily Motivation</div>
        <div className="text-sm text-gray-600">{getMotivationalQuote()}</div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Next level at {Math.ceil(level * 100)} points • Keep tracking to earn more!
      </div>
    </Card>
  );
};

export default GamificationCard;
