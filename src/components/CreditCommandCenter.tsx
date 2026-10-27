import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, ExternalLink, Gauge, Snowflake, TrendingDown, TriangleAlert, Zap } from 'lucide-react';
import { AccountItem } from '@/hooks/useFinancialData';
import { CreditSource, useCreditMonitoring } from '@/hooks/useCreditMonitoring';
import { formatCurrency } from '@/utils/formatters';
import CollapsibleSection from './CollapsibleSection';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';

interface CreditCommandCenterProps {
  creditAccounts: AccountItem[];
}

interface SimulatedCard {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minimum: number;
}

interface MonthlyPayment {
  id: string;
  name: string;
  minimum: number;
  avalanche: number;
  total: number;
  endingBalance: number;
}

const APR_EVIDENCE: Record<string, { label: string; verified: boolean }> = {
  'navy fed': { label: 'Aug 2026 statement', verified: true },
  'discover': { label: 'Jan 2026 statement', verified: true },
  'chase freedom': { label: 'Aug 2026 statement', verified: true },
  'capital one venture': { label: 'Oct 2026 account snapshot', verified: true },
  'capital one platinum': { label: 'Jan 2026 statement', verified: true },
  'amex blue': { label: 'Oct 2026 account snapshot', verified: true },
  'pnc core visa': { label: 'Oct 2026 account snapshot', verified: true },
  'apple card': { label: 'Jan 2026 statement', verified: true },
  'capone savor': { label: 'No statement downloaded - estimate', verified: false },
  'capone quicksilver': { label: 'Dec 2025 statement', verified: true },
  'amex white': { label: 'No statement downloaded - needs verification', verified: false },
};

const evidenceFor = (name: string) => APR_EVIDENCE[name.trim().toLowerCase()] || {
  label: 'Needs statement verification',
  verified: false,
};

const PROVIDERS: Array<{
  source: CreditSource;
  name: string;
  url: string;
  color: string;
}> = [
  { source: 'credit_karma', name: 'Credit Karma', url: 'https://www.creditkarma.com/', color: 'border-emerald-200 bg-emerald-50/70' },
  { source: 'credit_sesame', name: 'Credit Sesame', url: 'https://www.creditsesame.com/', color: 'border-violet-200 bg-violet-50/70' },
];

const simulate = (cards: SimulatedCard[], extraMonthly: number, strategy: 'avalanche' | 'snowball') => {
  const debts = cards.map((card) => ({ ...card, remaining: card.balance, payoffMonth: 0 }));
  let months = 0;
  let interest = 0;
  const schedule: Array<{ month: number; interest: number; payments: MonthlyPayment[] }> = [];
  const monthlyBudget = cards.reduce((sum, card) => sum + card.minimum, 0) + Math.max(0, extraMonthly);

  while (debts.some((card) => card.remaining > 0.01) && months < 600) {
    months += 1;
    let monthInterest = 0;
    const monthPayments = new Map<string, MonthlyPayment>();
    debts.forEach((card) => monthPayments.set(card.id, {
      id: card.id,
      name: card.name,
      minimum: 0,
      avalanche: 0,
      total: 0,
      endingBalance: card.remaining,
    }));
    debts.forEach((card) => {
      if (card.remaining <= 0) return;
      const monthlyInterest = card.remaining * (card.rate / 100 / 12);
      interest += monthlyInterest;
      monthInterest += monthlyInterest;
      card.remaining += monthlyInterest;
    });

    let budgetRemaining = monthlyBudget;

    // Pay every active card's minimum first.
    debts.forEach((card) => {
      if (card.remaining <= 0 || budgetRemaining <= 0) return;
      const payment = Math.min(card.minimum, card.remaining, budgetRemaining);
      card.remaining -= payment;
      budgetRemaining -= payment;
      const entry = monthPayments.get(card.id)!;
      entry.minimum += payment;
      entry.total += payment;
      if (card.remaining <= 0.01 && card.payoffMonth === 0) card.payoffMonth = months;
    });

    const active = debts.filter((card) => card.remaining > 0.01).sort((a, b) => (
      strategy === 'avalanche'
        ? b.rate - a.rate || a.remaining - b.remaining
        : a.remaining - b.remaining || b.rate - a.rate
    ));
    // Roll the extra payment and every freed minimum through the priority list.
    for (const card of active) {
      if (budgetRemaining <= 0) break;
      const payment = Math.min(budgetRemaining, card.remaining);
      card.remaining -= payment;
      budgetRemaining -= payment;
      const entry = monthPayments.get(card.id)!;
      entry.avalanche += payment;
      entry.total += payment;
      if (card.remaining <= 0.01 && card.payoffMonth === 0) card.payoffMonth = months;
    }
    debts.forEach((card) => {
      monthPayments.get(card.id)!.endingBalance = Math.max(0, card.remaining);
    });
    schedule.push({
      month: months,
      interest: monthInterest,
      payments: [...monthPayments.values()].filter((payment) => payment.total > 0.005),
    });
  }

  return {
    months,
    interest,
    order: [...debts].sort((a, b) => a.payoffMonth - b.payoffMonth),
    attackOrder: [...cards].sort((a, b) => (
      strategy === 'avalanche'
        ? b.rate - a.rate || a.balance - b.balance
        : a.balance - b.balance || b.rate - a.rate
    )),
    schedule,
  };
};

const duration = (months: number) => `${Math.floor(months / 12)}y ${months % 12}m`;

const CreditCommandCenter = ({ creditAccounts }: CreditCommandCenterProps) => {
  const { readings, saveReading } = useCreditMonitoring();
  const [weeklyIncome, setWeeklyIncome] = useState(600);
  const [extraMonthly, setExtraMonthly] = useState(520);
  const [showAllMonths, setShowAllMonths] = useState(false);

  const cards = useMemo<SimulatedCard[]>(() => creditAccounts
    .filter((account) => account.balance > 0)
    .map((account) => ({
      id: account.id,
      name: account.name,
      balance: account.balance,
      rate: account.interestRate || 0,
      minimum: account.minimumPayment ?? Math.max(25, account.balance * 0.02),
    })), [creditAccounts]);

  const totalDebt = cards.reduce((sum, card) => sum + card.balance, 0);
  const minimums = cards.reduce((sum, card) => sum + card.minimum, 0);
  const monthlyIncome = weeklyIncome * 52 / 12;
  const avalanche = useMemo(() => simulate(cards, extraMonthly, 'avalanche'), [cards, extraMonthly]);
  const snowball = useMemo(() => simulate(cards, extraMonthly, 'snowball'), [cards, extraMonthly]);
  const avalancheTarget = [...cards].sort((a, b) => b.rate - a.rate || a.balance - b.balance)[0];
  const bestInterest = Math.min(avalanche.interest, snowball.interest);
  const maxPayoffMonth = Math.max(1, ...avalanche.order.map((card) => card.payoffMonth));
  const visibleMonths = showAllMonths ? avalanche.schedule : avalanche.schedule.slice(0, 6);

  const handleScore = (source: CreditSource, value: string) => {
    if (value === '') {
      saveReading(source, null);
      return;
    }
    const score = Number(value);
    if (score >= 300 && score <= 850) saveReading(source, score);
  };

  return (
    <CollapsibleSection
      title="Credit Command Center"
      category="credit-command-center"
      icon={<Gauge className="h-5 w-5 text-indigo-600" />}
      defaultOpen
    >
      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2">
          {PROVIDERS.map((provider) => {
            const reading = readings[provider.source];
            return (
              <Card key={provider.source} className={`p-4 border-2 ${provider.color}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{provider.name}</p>
                    <p className="text-xs text-slate-500">{reading.bureau}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a href={provider.url} target="_blank" rel="noreferrer">
                      Open <ExternalLink className="ml-1 h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
                <div className="mt-4 flex items-end gap-3">
                  <div className="flex-1">
                    <Label htmlFor={`${provider.source}-score`} className="text-xs">Latest score</Label>
                    <Input
                      id={`${provider.source}-score`}
                      type="number"
                      min={300}
                      max={850}
                      value={reading.score ?? ''}
                      placeholder="300–850"
                      onChange={(event) => handleScore(provider.source, event.target.value)}
                      className="mt-1 text-xl font-bold"
                    />
                  </div>
                  {reading.checkedAt && (
                    <p className="pb-2 text-[11px] text-slate-500">
                      Updated {new Date(reading.checkedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {cards.length === 0 ? (
          <Card className="p-5 text-sm text-slate-600">
            Add your credit cards and balances to generate the payoff timeline.
          </Card>
        ) : (
          <>
            <Card className="p-4 sm:p-5 bg-slate-950 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Your payoff budget</p>
                  <p className="text-2xl font-bold">{formatCurrency(minimums + extraMonthly)}/month</p>
                </div>
                <Badge className="bg-indigo-500 hover:bg-indigo-500">
                  {monthlyIncome > 0 ? `${((minimums + extraMonthly) / monthlyIncome * 100).toFixed(0)}% of take-home` : 'Set income'}
                </Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="weekly-income" className="text-slate-300">Weekly take-home</Label>
                  <Input id="weekly-income" type="number" min={0} value={weeklyIncome} onChange={(event) => setWeeklyIncome(Number(event.target.value) || 0)} className="mt-1 bg-slate-900 border-slate-700" />
                </div>
                <div>
                  <Label htmlFor="extra-payment" className="text-slate-300">Extra monthly payment</Label>
                  <Input id="extra-payment" type="number" min={0} value={extraMonthly} onChange={(event) => setExtraMonthly(Number(event.target.value) || 0)} className="mt-1 bg-slate-900 border-slate-700" />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Starting assumption: $600/week with 20% directed to cards ≈ $520/month extra. Minimums stay on every card.
              </p>
            </Card>

            <div className="grid gap-3 md:grid-cols-2">
              <Card className="p-4 border-2 border-blue-200 bg-blue-50/60">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <p className="font-bold text-blue-950">Avalanche</p>
                  <Badge variant="secondary">Recommended</Badge>
                </div>
                <p className="mt-2 text-2xl font-bold text-blue-900">{duration(avalanche.months)}</p>
                <p className="text-sm text-blue-800">{formatCurrency(avalanche.interest)} projected interest</p>
              </Card>
              <Card className="p-4 border-2 border-violet-200 bg-violet-50/60">
                <div className="flex items-center gap-2">
                  <Snowflake className="h-5 w-5 text-violet-600" />
                  <p className="font-bold text-violet-950">Snowball</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-violet-900">{duration(snowball.months)}</p>
                <p className="text-sm text-violet-800">{formatCurrency(snowball.interest)} projected interest</p>
              </Card>
            </div>

            <Card className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">Avalanche attack order</p>
                  <p className="text-xs text-slate-500">This is the APR priority list - one row for each of your {cards.length} cards.</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Total card debt</p>
                  <p className="font-bold text-slate-900">{formatCurrency(totalDebt)}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {avalanche.attackOrder.map((card, index) => {
                  const evidence = evidenceFor(card.name);
                  return (
                  <div key={card.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-slate-900"><span className="mr-2 text-indigo-600">#{index + 1}</span>{card.name}</span>
                      <span className="shrink-0 font-semibold text-slate-900">{card.rate.toFixed(2)}%</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                      {evidence.verified ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <TriangleAlert className="h-3 w-3 text-amber-600" />}
                      <span>{evidence.label}</span>
                    </div>
                  </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">Projected payoff milestones</p>
                  <p className="text-xs text-slate-500">“Month 35” means that card reaches $0 during your 35th monthly payment - it does not mean 35 cards.</p>
                </div>
                <Badge variant="secondary">{cards.length} cards total</Badge>
              </div>
              <div className="mt-4 space-y-4">
                {avalanche.order.map((card, index) => (
                  <div key={card.id}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-medium"><span className="mr-2 text-indigo-600">#{index + 1}</span>{card.name}</span>
                      <span className="shrink-0 font-medium text-slate-700">paid off in month {card.payoffMonth}</span>
                    </div>
                    <Progress value={(card.payoffMonth / maxPayoffMonth) * 100} className="h-2.5" />
                    <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                      <span>{formatCurrency(card.balance)} at {card.rate.toFixed(1)}%</span>
                      <span>{formatCurrency(card.minimum)} minimum</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">Where your payment goes each month</p>
                  <p className="text-xs text-slate-500">Minimum = required payment. Avalanche = extra cash plus minimums freed by cards already paid off.</p>
                </div>
                <Badge variant="outline">{formatCurrency(minimums + extraMonthly)}/month</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {visibleMonths.map((month) => (
                  <div key={month.month} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900">Month {month.month}</p>
                      <p className="text-xs text-slate-500">{formatCurrency(month.interest)} interest added</p>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {month.payments.map((payment) => (
                        <div key={payment.id} className="flex flex-wrap items-center justify-between gap-x-3 text-sm">
                          <span className="font-medium text-slate-700">{payment.name}</span>
                          <span className="text-slate-600">
                            {formatCurrency(payment.total)}
                            <span className="ml-1 text-[11px] text-slate-400">({formatCurrency(payment.minimum)} minimum{payment.avalanche > 0.005 ? ` + ${formatCurrency(payment.avalanche)} avalanche` : ''})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {avalanche.schedule.length > 6 && (
                <Button variant="ghost" className="mt-3 w-full" onClick={() => setShowAllMonths((value) => !value)}>
                  {showAllMonths ? <>Show first 6 months <ChevronUp className="ml-1 h-4 w-4" /></> : <>Show all {avalanche.schedule.length} months <ChevronDown className="ml-1 h-4 w-4" /></>}
                </Button>
              )}
            </Card>

            <Card className="flex items-start gap-3 p-4 bg-emerald-50 border-emerald-200">
              <TrendingDown className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-900">Best current plan</p>
                <p className="text-sm text-emerald-800">
                  Use avalanche, keep every minimum on autopay, and start the {formatCurrency(extraMonthly)} extra with {avalancheTarget?.name}; any amount left after it reaches $0 rolls immediately to the next card. Projected interest: {formatCurrency(bestInterest)}.
                </p>
              </div>
            </Card>
          </>
        )}
      </div>
    </CollapsibleSection>
  );
};

export default CreditCommandCenter;

