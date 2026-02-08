import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Import, ChevronRight, CheckCircle2, TrendingUp, Wallet, CreditCard, PiggyBank } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { AccountItem } from '@/hooks/useFinancialData';

interface OnboardingWelcomeProps {
  open: boolean;
  onClose: () => void;
  onStartGuided: () => void;
  onImportDemo: (data: {
    accounts: {
      cash: AccountItem[];
      investments: AccountItem[];
      credit: AccountItem[];
      loans: AccountItem[];
      otherAssets: AccountItem[];
    };
    monthlyExpenses: number;
  }) => void;
}

const demoData = {
  accounts: {
    cash: [
      { id: uuidv4(), name: "Main Checking", balance: 4250, interestRate: 0.01 },
      { id: uuidv4(), name: "Emergency Fund", balance: 8500, interestRate: 4.5 },
      { id: uuidv4(), name: "Everyday Savings", balance: 2100, interestRate: 3.8 },
    ],
    investments: [
      { id: uuidv4(), name: "401(k)", balance: 45000, interestRate: 8.0 },
      { id: uuidv4(), name: "Roth IRA", balance: 12500, interestRate: 7.5 },
      { id: uuidv4(), name: "Brokerage Account", balance: 8200, interestRate: 9.0 },
    ],
    credit: [
      { id: uuidv4(), name: "Chase Sapphire", balance: 2400, interestRate: 21.99, creditLimit: 10000 },
      { id: uuidv4(), name: "Discover It", balance: 850, interestRate: 18.99, creditLimit: 5000 },
    ],
    loans: [
      { id: uuidv4(), name: "Student Loan", balance: 18500, interestRate: 5.5 },
      { id: uuidv4(), name: "Car Loan", balance: 12000, interestRate: 6.9 },
    ],
    otherAssets: [
      { id: uuidv4(), name: "Home Equity", balance: 65000, interestRate: 3.0 },
    ],
  },
  monthlyExpenses: 3500,
};

const OnboardingWelcome = ({ open, onClose, onStartGuided, onImportDemo }: OnboardingWelcomeProps) => {
  const [step, setStep] = useState<'welcome' | 'choice'>('welcome');
  const [isImporting, setIsImporting] = useState(false);

  const handleImportDemo = async () => {
    setIsImporting(true);
    // Generate fresh UUIDs for demo data
    const freshDemoData = {
      accounts: {
        cash: demoData.accounts.cash.map(acc => ({ ...acc, id: uuidv4() })),
        investments: demoData.accounts.investments.map(acc => ({ ...acc, id: uuidv4() })),
        credit: demoData.accounts.credit.map(acc => ({ ...acc, id: uuidv4() })),
        loans: demoData.accounts.loans.map(acc => ({ ...acc, id: uuidv4() })),
        otherAssets: demoData.accounts.otherAssets.map(acc => ({ ...acc, id: uuidv4() })),
      },
      monthlyExpenses: demoData.monthlyExpenses,
    };
    
    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    onImportDemo(freshDemoData);
    setIsImporting(false);
    onClose();
  };

  const handleStartGuided = () => {
    onStartGuided();
    onClose();
  };

  const handleGetStarted = () => {
    setStep('choice');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 border-0 shadow-2xl">
        {step === 'welcome' ? (
          <>
            <DialogHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Welcome to Pathline
              </DialogTitle>
              <DialogDescription className="text-slate-600 mt-2">
                Your journey to financial clarity starts here
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center p-3 rounded-xl bg-white/60 border border-blue-100">
                  <Wallet className="w-6 h-6 text-blue-600 mb-2" />
                  <span className="text-xs text-slate-600 text-center">Track Net Worth</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-white/60 border border-indigo-100">
                  <CreditCard className="w-6 h-6 text-indigo-600 mb-2" />
                  <span className="text-xs text-slate-600 text-center">Manage Debt</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-white/60 border border-purple-100">
                  <PiggyBank className="w-6 h-6 text-purple-600 mb-2" />
                  <span className="text-xs text-slate-600 text-center">Plan Runway</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-white/60 border border-green-100">
                  <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-xs text-slate-600 text-center">Grow Wealth</span>
                </div>
              </div>

              <Button 
                onClick={handleGetStarted}
                className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Get Started
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="text-center pb-2">
              <DialogTitle className="text-xl font-bold text-slate-900">
                How would you like to start?
              </DialogTitle>
              <DialogDescription className="text-slate-600 mt-1">
                Choose the best option for you
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              {/* Self-guided option */}
              <button
                onClick={handleStartGuided}
                className="w-full p-4 rounded-xl bg-white/80 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Start Fresh</h3>
                    <p className="text-sm text-slate-600 mb-2">
                      I know my finances and want to enter my own data
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Full control
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Start from zero
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors mt-1" />
                </div>
              </button>

              {/* Demo data option */}
              <button
                onClick={handleImportDemo}
                disabled={isImporting}
                className="w-full p-4 rounded-xl bg-white/80 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200 text-left group disabled:opacity-70"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    {isImporting ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Import className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Explore with Demo Data</h3>
                    <p className="text-sm text-slate-600 mb-2">
                      See everything in action with sample data you can edit
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full">
                        <Sparkles className="w-3 h-3" /> Pre-filled example
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Fully editable
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors mt-1" />
                </div>
              </button>
            </div>

            <p className="text-xs text-center text-slate-500 pt-2">
              You can always clear and restart anytime from the dashboard
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWelcome;
