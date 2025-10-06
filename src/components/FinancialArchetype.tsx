import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Flame, Compass, Mountain, Sparkles, Brain, Heart, Target } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import CollapsibleSection from './CollapsibleSection';

interface FinancialArchetypeProps {
  totalAssets: number;
  totalLiabilities: number;
  runway: number;
  monthlyExpenses: number;
  cashBalance: number;
  investmentBalance: number;
  creditBalance: number;
  accountCount: number;
}

interface Archetype {
  name: string;
  icon: any;
  color: string;
  bgGradient: string;
  description: string;
  strengths: string[];
  shadows: string[];
  growthPath: string;
  famousArchetype: string;
  coreMotivation: string;
  moneyPhilosophy: string;
}

const FinancialArchetype = ({
  totalAssets,
  totalLiabilities,
  runway,
  monthlyExpenses,
  cashBalance,
  investmentBalance,
  creditBalance,
  accountCount,
}: FinancialArchetypeProps) => {
  
  const calculateArchetype = (): Archetype => {
    const netWorth = totalAssets - totalLiabilities;
    const debtRatio = totalAssets > 0 ? totalLiabilities / totalAssets : 0;
    const cashRatio = totalAssets > 0 ? cashBalance / totalAssets : 0;
    const investmentRatio = totalAssets > 0 ? investmentBalance / totalAssets : 0;
    const leverageComfort = debtRatio > 0.5;
    const runwayStrong = runway >= 6;
    const runwayWeak = runway < 3;
    const highDiversification = accountCount > 5;
    const investmentFocused = investmentRatio > 0.4;
    const cashHoarder = cashRatio > 0.6;
    
    // The Guardian - Conservative, high savings, low debt
    if (runwayStrong && debtRatio < 0.2 && cashHoarder) {
      return {
        name: 'The Guardian',
        icon: Shield,
        color: 'emerald',
        bgGradient: 'from-emerald-50 to-teal-50',
        description: 'You are the protector of stability. Security is your fortress, and you build walls of savings brick by brick.',
        strengths: [
          'Exceptional discipline and delayed gratification',
          'Emotional stability during financial storms',
          'Natural ability to spot and avoid financial risks',
          'Creates deep sense of security for loved ones'
        ],
        shadows: [
          'May sacrifice present joy for future security',
          'Risk aversion can limit growth opportunities',
          'Difficulty enjoying money earned through hard work',
          'Can judge others\' financial choices harshly'
        ],
        growthPath: 'Learn to balance security with calculated risks. Your fortress is strong—now build bridges to new opportunities.',
        famousArchetype: 'Warren Buffett\'s early philosophy of "never lose money"',
        coreMotivation: 'Safety and protection from uncertainty',
        moneyPhilosophy: 'Money is a shield that protects against life\'s chaos'
      };
    }
    
    // The Warrior - Aggressive debt payoff, disciplined, focused
    if (debtRatio < 0.3 && !runwayWeak && netWorth > 0 && totalLiabilities > 5000) {
      return {
        name: 'The Warrior',
        icon: Flame,
        color: 'red',
        bgGradient: 'from-red-50 to-orange-50',
        description: 'You are the conqueror of debt. Every dollar is a weapon in your battle for financial freedom.',
        strengths: [
          'Unmatched determination and mental toughness',
          'Transforms financial challenges into personal victories',
          'Inspires others through visible progress',
          'Develops incredible willpower and self-control'
        ],
        shadows: [
          'Can become obsessive about debt elimination',
          'May neglect present experiences for future freedom',
          'Tendency to see money as a battlefield',
          'Risk of burnout from relentless pursuit'
        ],
        growthPath: 'Remember that you\'re fighting for peace, not just victory. Celebrate milestones and learn to enjoy the journey.',
        famousArchetype: 'Dave Ramsey\'s "Gazelle Intensity"',
        coreMotivation: 'Freedom through conquest of financial obligations',
        moneyPhilosophy: 'Debt is the enemy; financial freedom is the only acceptable outcome'
      };
    }
    
    // The Builder - Balanced, diversified, growing steadily
    if (highDiversification && netWorth > 0 && debtRatio < 0.4 && runway >= 3) {
      return {
        name: 'The Builder',
        icon: Mountain,
        color: 'blue',
        bgGradient: 'from-blue-50 to-indigo-50',
        description: 'You are the architect of prosperity. Each financial decision is a carefully placed stone in your empire.',
        strengths: [
          'Strategic thinking and long-term vision',
          'Natural talent for creating systems and structures',
          'Balanced approach prevents catastrophic failures',
          'Builds wealth that lasts generations'
        ],
        shadows: [
          'Can become overly focused on optimization',
          'May miss opportunities while perfecting the plan',
          'Risk of analysis paralysis',
          'Sometimes values the system over the purpose'
        ],
        growthPath: 'Your foundation is strong. Now build higher. Take calculated risks that align with your values.',
        famousArchetype: 'Ray Dalio\'s principle-driven approach',
        coreMotivation: 'Creating lasting prosperity through thoughtful construction',
        moneyPhilosophy: 'Wealth is built methodically, one wise decision at a time'
      };
    }
    
    // The Adventurer - Investment focused, comfortable with leverage
    if (investmentFocused && (leverageComfort || debtRatio > 0.3)) {
      return {
        name: 'The Adventurer',
        icon: Compass,
        color: 'purple',
        bgGradient: 'from-purple-50 to-pink-50',
        description: 'You are the explorer of possibility. Where others see risk, you see opportunity waiting to be seized.',
        strengths: [
          'Courage to pursue growth over security',
          'Quick to spot and act on opportunities',
          'Resilient in face of setbacks',
          'Lives life fully in the present'
        ],
        shadows: [
          'Can underestimate true risk until it\'s too late',
          'May prioritize excitement over sustainable growth',
          'Difficulty with delayed gratification',
          'Risk tolerance can make others uncomfortable'
        ],
        growthPath: 'Your boldness is a gift. Pair it with the Guardian\'s wisdom. Build a safety net before your next leap.',
        famousArchetype: 'Elon Musk\'s "all-in" approach',
        coreMotivation: 'Growth, expansion, and experiencing life\'s possibilities',
        moneyPhilosophy: 'Money is fuel for adventures and opportunities'
      };
    }
    
    // The Alchemist - High assets, leveraging debt strategically
    if (totalAssets > 50000 && leverageComfort && netWorth > 0) {
      return {
        name: 'The Alchemist',
        icon: Sparkles,
        color: 'amber',
        bgGradient: 'from-amber-50 to-yellow-50',
        description: 'You are the transformer of resources. You see debt not as burden but as leverage—turning borrowed money into owned wealth.',
        strengths: [
          'Sophisticated understanding of financial instruments',
          'Sees opportunities others miss',
          'Comfortable with complexity',
          'Can create wealth from seemingly nothing'
        ],
        shadows: [
          'Risk of overconfidence in market timing',
          'May underestimate downside scenarios',
          'Can appear reckless to more conservative types',
          'Success can breed complacency'
        ],
        growthPath: 'Your skills are rare and powerful. Master the art of knowing when NOT to act. Wisdom is knowing which opportunities to decline.',
        famousArchetype: 'Robert Kiyosaki\'s "Good Debt" philosophy',
        coreMotivation: 'Transforming resources into exponential returns',
        moneyPhilosophy: 'Leverage and strategy can multiply what you already have'
      };
    }
    
    // The Seeker - Still finding their way
    if (netWorth < 5000 || runwayWeak) {
      return {
        name: 'The Seeker',
        icon: Brain,
        color: 'slate',
        bgGradient: 'from-slate-50 to-gray-50',
        description: 'You are at the beginning of your journey. Every master was once a beginner who refused to give up.',
        strengths: [
          'Open to learning and growth',
          'Humility to acknowledge current position',
          'Courage to face financial reality',
          'Unlimited potential ahead'
        ],
        shadows: [
          'May feel overwhelmed by the path ahead',
          'Risk of comparison with others further along',
          'Can be susceptible to get-rich-quick schemes',
          'Self-doubt can prevent taking first steps'
        ],
        growthPath: 'Your greatest asset is that you\'re here, learning, tracking. Every expert was once where you are. Focus on progress, not perfection.',
        famousArchetype: 'Every successful person\'s origin story',
        coreMotivation: 'Finding stability and clarity in financial life',
        moneyPhilosophy: 'Money is a puzzle to solve, a skill to master'
      };
    }
    
    // The Monk - Minimal expenses, simple lifestyle, growing wealth quietly
    if (monthlyExpenses < 2000 && netWorth > 10000 && debtRatio < 0.1) {
      return {
        name: 'The Monk',
        icon: Heart,
        color: 'violet',
        bgGradient: 'from-violet-50 to-purple-50',
        description: 'You have transcended the consumer treadmill. Your wealth grows not from earning more, but from needing less.',
        strengths: [
          'Freedom from material attachments',
          'Clear understanding of true needs vs wants',
          'Immune to lifestyle inflation',
          'Finds joy in simplicity and purpose'
        ],
        shadows: [
          'May judge those who enjoy material pleasures',
          'Risk of being too extreme in frugality',
          'Can miss experiences worth the cost',
          'May struggle to spend even when appropriate'
        ],
        growthPath: 'You\'ve mastered restraint. Now master generosity and strategic spending. Money saved has no impact—only money deployed.',
        famousArchetype: 'Mr. Money Mustache\'s intentional lifestyle',
        coreMotivation: 'Freedom from desire and consumer culture',
        moneyPhilosophy: 'True wealth is wanting what you have, not having what you want'
      };
    }
    
    // Default - The Strategist
    return {
      name: 'The Strategist',
      icon: Target,
      color: 'cyan',
      bgGradient: 'from-cyan-50 to-blue-50',
      description: 'You are the master of balance. You understand that optimal isn\'t perfect—it\'s sustainable.',
      strengths: [
        'Balanced approach to risk and security',
        'Makes decisions based on data, not emotion',
        'Adaptable to changing circumstances',
        'Maintains perspective during market volatility'
      ],
      shadows: [
        'Can overthink decisions to the point of paralysis',
        'May lack the boldness to make big moves',
        'Risk of staying comfortable when growth requires discomfort',
        'Can become too focused on optimization'
      ],
      growthPath: 'Your balance is admirable. Push your boundaries intentionally. The next level requires calculated discomfort.',
      famousArchetype: 'John Bogle\'s index fund philosophy',
      coreMotivation: 'Sustainable, consistent progress toward financial goals',
      moneyPhilosophy: 'Slow and steady wins the race; consistency beats intensity'
    };
  };
  
  const archetype = calculateArchetype();
  const ArchetypeIcon = archetype.icon;
  
  const getTraitStrength = (trait: string): number => {
    // Calculate trait strengths based on financial data
    const netWorth = totalAssets - totalLiabilities;
    const debtRatio = totalAssets > 0 ? totalLiabilities / totalAssets : 0;
    
    switch (trait) {
      case 'Risk Tolerance':
        return Math.min(100, debtRatio * 150 + (investmentBalance / totalAssets) * 100);
      case 'Security Focus':
        return Math.min(100, runway * 12 + (1 - debtRatio) * 50);
      case 'Growth Mindset':
        return Math.min(100, (investmentBalance / totalAssets) * 120 + accountCount * 10);
      case 'Discipline':
        return Math.min(100, (runway >= 6 ? 80 : runway * 13) + (debtRatio < 0.3 ? 20 : 0));
      default:
        return 50;
    }
  };
  
  const traits = [
    { name: 'Risk Tolerance', value: getTraitStrength('Risk Tolerance') },
    { name: 'Security Focus', value: getTraitStrength('Security Focus') },
    { name: 'Growth Mindset', value: getTraitStrength('Growth Mindset') },
    { name: 'Discipline', value: getTraitStrength('Discipline') },
  ];
  
  return (
    <CollapsibleSection
      title="Financial Archetype"
      category="financial-archetype"
      icon={<Brain className="h-5 w-5 text-primary" />}
      defaultOpen={true}
    >
      <div className="space-y-6">
        {/* Main Archetype Card */}
        <Card className={`p-6 bg-gradient-to-br ${archetype.bgGradient} border-${archetype.color}-200`}>
          <div className="flex items-start gap-4 mb-4">
            <div className={`p-4 bg-${archetype.color}-100 rounded-xl`}>
              <ArchetypeIcon className={`h-8 w-8 text-${archetype.color}-600`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className={`text-2xl font-bold text-${archetype.color}-900`}>{archetype.name}</h3>
                <Badge className={`bg-${archetype.color}-600 text-white`}>Your Archetype</Badge>
              </div>
              <p className={`text-${archetype.color}-700 italic mb-3`}>{archetype.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className={`p-3 bg-white rounded-lg border border-${archetype.color}-200`}>
                  <p className="text-xs font-semibold text-slate-600 mb-1">Core Motivation</p>
                  <p className="text-sm text-slate-800">{archetype.coreMotivation}</p>
                </div>
                <div className={`p-3 bg-white rounded-lg border border-${archetype.color}-200`}>
                  <p className="text-xs font-semibold text-slate-600 mb-1">Money Philosophy</p>
                  <p className="text-sm text-slate-800">{archetype.moneyPhilosophy}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Personality Traits */}
        <Card className="p-6">
          <h4 className="font-bold text-slate-800 mb-4">Your Financial Personality Traits</h4>
          <div className="space-y-4">
            {traits.map((trait) => (
              <div key={trait.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{trait.name}</span>
                  <span className="text-sm font-semibold text-slate-600">{Math.round(trait.value)}/100</span>
                </div>
                <Progress value={trait.value} className="h-2" />
              </div>
            ))}
          </div>
        </Card>
        
        {/* Strengths */}
        <Card className={`p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200`}>
          <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Your Superpowers
          </h4>
          <ul className="space-y-2">
            {archetype.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </Card>
        
        {/* Shadows */}
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Your Shadow Side (Growth Areas)
          </h4>
          <ul className="space-y-2">
            {archetype.shadows.map((shadow, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
                <span className="text-amber-600 mt-0.5">⚠</span>
                <span>{shadow}</span>
              </li>
            ))}
          </ul>
        </Card>
        
        {/* Growth Path */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
            <Mountain className="h-5 w-5" />
            Your Path Forward
          </h4>
          <p className="text-sm text-purple-800 mb-4">{archetype.growthPath}</p>
          <div className="p-3 bg-white rounded-lg border border-purple-200">
            <p className="text-xs font-semibold text-purple-700 mb-1">Similar Archetype in Finance:</p>
            <p className="text-sm text-purple-900">{archetype.famousArchetype}</p>
          </div>
        </Card>
      </div>
    </CollapsibleSection>
  );
};

export default FinancialArchetype;
