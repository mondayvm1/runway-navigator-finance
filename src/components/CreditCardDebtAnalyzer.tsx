import { Card } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Target, Zap } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { AccountItem } from '@/hooks/useFinancialData';
import CollapsibleSection from './CollapsibleSection';

interface CreditCardDebtAnalyzerProps {
  creditAccounts: AccountItem[];
}

interface DebtCard {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  monthlyInterest: number;
  annualInterestCost: number;
}

const CreditCardDebtAnalyzer = ({ creditAccounts }: CreditCardDebtAnalyzerProps) => {
  // Filter to only cards with balances and interest rates
  const debtCards: DebtCard[] = creditAccounts
    .filter(acc => acc.balance > 0)
    .map(acc => {
      const rate = acc.interestRate || 0;
      const monthlyRate = rate / 100 / 12;
      const monthlyInterest = acc.balance * monthlyRate;
      const annualInterestCost = monthlyInterest * 12;
      const minPayment = acc.minimumPayment || Math.max(25, acc.balance * 0.02);
      
      return {
        id: acc.id,
        name: acc.name,
        balance: acc.balance,
        interestRate: rate,
        minimumPayment: minPayment,
        monthlyInterest,
        annualInterestCost
      };
    })
    .filter(card => card.interestRate > 0);

  if (debtCards.length === 0) {
    return null;
  }

  // Calculate totals
  const totalDebt = debtCards.reduce((sum, card) => sum + card.balance, 0);
  const totalMonthlyInterest = debtCards.reduce((sum, card) => sum + card.monthlyInterest, 0);
  const totalAnnualInterest = totalMonthlyInterest * 12;
  const weightedAvgRate = debtCards.reduce((sum, card) => sum + (card.interestRate * card.balance), 0) / totalDebt;

  // Sort strategies
  const avalancheOrder = [...debtCards].sort((a, b) => b.interestRate - a.interestRate); // Highest rate first
  const snowballOrder = [...debtCards].sort((a, b) => a.balance - b.balance); // Lowest balance first

  // Calculate how fucked they are
  const fuckednessScore = Math.min(100, (totalAnnualInterest / totalDebt) * 100);
  const getFuckednessLevel = () => {
    if (fuckednessScore < 10) return { label: "Manageable", color: "text-green-600", emoji: "👍" };
    if (fuckednessScore < 20) return { label: "Concerning", color: "text-yellow-600", emoji: "⚠️" };
    if (fuckednessScore < 30) return { label: "Serious Problem", color: "text-orange-600", emoji: "🔥" };
    return { label: "CRITICAL", color: "text-red-600", emoji: "🚨" };
  };

  const fuckedness = getFuckednessLevel();

  // Calculate potential savings with avalanche method
  const calculatePayoffWithStrategy = (cards: DebtCard[], extraPayment: number = 200) => {
    let remainingCards = cards.map(c => ({ ...c, remaining: c.balance }));
    let months = 0;
    let totalInterestPaid = 0;
    const totalMinPayment = cards.reduce((sum, c) => sum + c.minimumPayment, 0);

    while (remainingCards.some(c => c.remaining > 0) && months < 600) {
      months++;
      
      // Pay minimum on all cards and interest
      remainingCards.forEach(card => {
        if (card.remaining > 0) {
          const interest = (card.remaining * card.interestRate / 100 / 12);
          totalInterestPaid += interest;
          card.remaining += interest;
          const payment = Math.min(card.minimumPayment, card.remaining);
          card.remaining -= payment;
        }
      });

      // Apply extra payment to first card with balance (highest priority)
      const targetCard = remainingCards.find(c => c.remaining > 0);
      if (targetCard && extraPayment > 0) {
        const payment = Math.min(extraPayment, targetCard.remaining);
        targetCard.remaining -= payment;
      }
    }

    return { months, totalInterestPaid };
  };

  const avalancheResult = calculatePayoffWithStrategy(avalancheOrder);
  const snowballResult = calculatePayoffWithStrategy(snowballOrder);

  return (
    <CollapsibleSection
      title="Credit Card Debt Analysis"
      category="debt-analysis"
      icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
      defaultOpen={true}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* How Fucked Are You */}
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-xl font-bold text-red-900 flex items-center gap-1 sm:gap-2">
              <span className="text-lg sm:text-2xl">{fuckedness.emoji}</span>
              <span className="hidden sm:inline">Debt Status: </span><span className={fuckedness.color}>{fuckedness.label}</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-white/80 p-2 sm:p-4 rounded-lg">
              <p className="text-[10px] sm:text-sm text-gray-600">Total Debt</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600 truncate">{formatCurrency(totalDebt)}</p>
            </div>
            
            <div className="bg-white/80 p-2 sm:p-4 rounded-lg">
              <p className="text-[10px] sm:text-sm text-gray-600">Monthly Interest</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600 truncate">{formatCurrency(totalMonthlyInterest)}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Gone forever</p>
            </div>
            
            <div className="bg-white/80 p-2 sm:p-4 rounded-lg">
              <p className="text-[10px] sm:text-sm text-gray-600">Annual Interest</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600 truncate">{formatCurrency(totalAnnualInterest)}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Per year</p>
            </div>
            
            <div className="bg-white/80 p-2 sm:p-4 rounded-lg">
              <p className="text-[10px] sm:text-sm text-gray-600">Avg Rate</p>
              <p className="text-lg sm:text-2xl font-bold text-orange-600">{weightedAvgRate.toFixed(1)}%</p>
              <p className="text-[10px] text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Weighted</p>
            </div>
          </div>
        </Card>

        {/* Attack Strategy: Avalanche Method (Recommended) */}
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            <h3 className="text-sm sm:text-lg font-bold text-blue-900">AVALANCHE (Recommended)</h3>
          </div>
          
          <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
            Pay minimums, put extra toward <strong>highest rate first</strong>.
          </p>

          <div className="space-y-2 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm font-semibold text-blue-800">Attack Order:</p>
            {avalancheOrder.slice(0, 3).map((card, idx) => (
              <div key={card.id} className="bg-white p-2 sm:p-3 rounded border-l-4 border-blue-500">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-blue-600">#{idx + 1}</span> <span className="truncate">{card.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs sm:text-sm font-semibold text-red-600">{card.interestRate.toFixed(1)}%</div>
                    <div className="text-[10px] sm:text-xs text-gray-600">{formatCurrency(card.balance)}</div>
                  </div>
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  {formatCurrency(card.monthlyInterest)}/mo interest
                </div>
              </div>
            ))}
            {avalancheOrder.length > 3 && (
              <p className="text-[10px] sm:text-xs text-gray-500 pl-3">...and {avalancheOrder.length - 3} more</p>
            )}
          </div>

          <div className="bg-green-50 p-3 sm:p-4 rounded border border-green-200">
            <p className="text-xs sm:text-sm font-semibold text-green-800">With $200/mo extra:</p>
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-2">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-600">Debt-free in:</p>
                <p className="text-base sm:text-lg font-bold text-green-700">
                  {Math.floor(avalancheResult.months / 12)}y {avalancheResult.months % 12}m
                </p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-600">Interest paid:</p>
                <p className="text-base sm:text-lg font-bold text-green-700">
                  {formatCurrency(avalancheResult.totalInterestPaid)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Alternative: Snowball Method */}
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Target className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            <h3 className="text-sm sm:text-lg font-bold text-purple-900">SNOWBALL (Motivation)</h3>
          </div>
          
          <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
            Pay minimums, put extra toward <strong>smallest balance first</strong>.
          </p>

          <div className="space-y-2 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm font-semibold text-purple-800">Attack Order:</p>
            {snowballOrder.slice(0, 3).map((card, idx) => (
              <div key={card.id} className="bg-white p-2 sm:p-3 rounded border-l-4 border-purple-500">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-purple-600">#{idx + 1}</span> <span className="truncate">{card.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs sm:text-sm font-semibold text-gray-800">{formatCurrency(card.balance)}</div>
                    <div className="text-[10px] sm:text-xs text-gray-600">{card.interestRate.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            ))}
            {snowballOrder.length > 3 && (
              <p className="text-[10px] sm:text-xs text-gray-500 pl-3">...and {snowballOrder.length - 3} more</p>
            )}
          </div>

          <div className="bg-yellow-50 p-3 sm:p-4 rounded border border-yellow-200">
            <p className="text-xs sm:text-sm font-semibold text-yellow-800">With $200/mo extra:</p>
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-2">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-600">Debt-free in:</p>
                <p className="text-base sm:text-lg font-bold text-yellow-700">
                  {Math.floor(snowballResult.months / 12)}y {snowballResult.months % 12}m
                </p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-600">Interest paid:</p>
                <p className="text-base sm:text-lg font-bold text-yellow-700">
                  {formatCurrency(snowballResult.totalInterestPaid)}
                </p>
              </div>
            </div>
            {snowballResult.totalInterestPaid > avalancheResult.totalInterestPaid && (
              <p className="text-[10px] sm:text-xs text-orange-600 mt-2">
                ⚠️ Costs {formatCurrency(snowballResult.totalInterestPaid - avalancheResult.totalInterestPaid)} more
              </p>
            )}
          </div>
        </Card>

        {/* Quick Tips */}
        <Card className="p-3 sm:p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
          <h4 className="font-semibold text-xs sm:text-sm text-emerald-900 mb-1.5 sm:mb-2 flex items-center gap-2">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            Quick Tips
          </h4>
          <ul className="text-[10px] sm:text-sm text-emerald-800 space-y-0.5 sm:space-y-1 list-disc list-inside">
            <li>Stop using the cards</li>
            <li>Pay more than minimum</li>
            <li>Consider 0% balance transfer</li>
            <li>Windfalls → debt</li>
          </ul>
        </Card>
      </div>
    </CollapsibleSection>
  );
};

export default CreditCardDebtAnalyzer;
