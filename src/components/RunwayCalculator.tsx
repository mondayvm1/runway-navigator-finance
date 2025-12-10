import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import NetWorthSummary from "./NetWorthSummary";
import AccountSection from "./AccountSection";
import SnapshotManager from "./SnapshotManager";
import SnapshotChart from "./SnapshotChart";
import GamificationCard from "./GamificationCard";
import DataRecoveryButton from "./DataRecoveryButton";
import MassImportDialog from "./MassImportDialog";
import SnapshotViewer from "./SnapshotViewer";
import IncomeManager, { IncomeEvent } from "./IncomeManager";
import FinancialInsights from "./FinancialInsights";
import EnhancedRunwayChart from "./EnhancedRunwayChart";
import EnhancedSnapshotManager from "./EnhancedSnapshotManager";
import RunwayChart from "./RunwayChart";
import FinancialAllocationCharts from "./FinancialAllocationCharts";
import PaymentTracker from "./PaymentTracker";
import CreditCardDebtAnalyzer from "./CreditCardDebtAnalyzer";
import CreditScoreEstimator from "./CreditScoreEstimator";
import FinancialQuestJourney from "./FinancialQuestJourney";
import DatabaseCleanupTool from "./DatabaseCleanupTool";
import FinancialArchetype from "./FinancialArchetype";
import MonthlyExpensesManager from "./MonthlyExpensesManager";
import { Clock, DollarSign, CalendarDays, Landmark, Wallet, CreditCard, Coins, BadgeEuro, ChartPie, LogOut, Trash2, Camera, Sparkles, TrendingUp, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/hooks/useAuth';
import { useFinancialData, AccountItem } from '@/hooks/useFinancialData';

const RunwayCalculator = () => {
  const { user, signOut } = useAuth();
  const {
    accountData,
    setAccountData,
    monthlyExpenses,
    incomeEvents,
    incomeEnabled,
    addIncomeEvent,
    removeIncomeEvent,
    updateIncomeEnabled,
    updateAccountField,
    updateMonthlyExpenses,
    hiddenCategories,
    setHiddenCategories,
    saveData,
    createSnapshot,
    updateAccountName,
    loading,
    dataFound,
    loadData,
    restoreFromSnapshotData,
  } = useFinancialData();

  const [runway, setRunway] = useState({
    days: 0,
    months: 0,
    withIncomeMonths: 0,
    additionalMonthsFromIncome: 0,
  });

  const [showSnapshotViewer, setShowSnapshotViewer] = useState(false);

  // Calculate runway whenever relevant data changes
  useEffect(() => {
    console.log('Runway calculation triggered by data change');
    calculateRunway();
  }, [accountData, monthlyExpenses, hiddenCategories, incomeEvents, incomeEnabled]);

  // Additional effect to ensure calculation runs after initial data load
  useEffect(() => {
    if (user && !loading) {
      console.log('Triggering runway calculation after data load');
      // Small delay to ensure all data is properly set
      setTimeout(() => calculateRunway(), 100);
    }
  }, [user, loading, dataFound]);

  // Auto-save data whenever it changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user && (accountData.cash.length > 0 || accountData.investments.length > 0 || 
          accountData.credit.length > 0 || accountData.loans.length > 0 || 
          accountData.otherAssets.length > 0 || monthlyExpenses > 0)) {
        saveData();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [accountData, monthlyExpenses, hiddenCategories, user, saveData]);

  const calculateRunway = () => {
    console.log('=== RUNWAY CALCULATION START ===');
    console.log('Calculating runway with:', { 
      monthlyExpenses, 
      incomeEnabled, 
      incomeEventsCount: incomeEvents.length,
      totalCash: accountData.cash.reduce((sum, account) => sum + account.balance, 0)
    });

    // Calculate total available for runway based on visible categories
    const totalAssets =
      (!hiddenCategories.cash ? accountData.cash.reduce((sum, account) => sum + account.balance, 0) : 0) +
      (!hiddenCategories.investments ? accountData.investments.reduce((sum, account) => sum + account.balance, 0) : 0) +
      (!hiddenCategories.otherAssets ? accountData.otherAssets.reduce((sum, account) => sum + account.balance, 0) : 0);
    const totalLiabilities =
      (!hiddenCategories.credit ? accountData.credit.reduce((sum, account) => sum + account.balance, 0) : 0) +
      (!hiddenCategories.loans ? accountData.loans.reduce((sum, account) => sum + account.balance, 0) : 0);
    const netAvailable = totalAssets - totalLiabilities;

    if (monthlyExpenses <= 0) {
      console.log('No monthly expenses set, setting runway to 0');
      setRunway({ days: 0, months: 0, withIncomeMonths: 0, additionalMonthsFromIncome: 0 });
      return;
    }

    if (netAvailable <= 0) {
      console.log('No cash available, setting runway to 0');
      setRunway({ days: 0, months: 0, withIncomeMonths: 0, additionalMonthsFromIncome: 0 });
      return;
    }

    const dailyExpenses = monthlyExpenses / 30;
    const totalDays = Math.floor(netAvailable / dailyExpenses);
    const baseMonths = Number((netAvailable / monthlyExpenses).toFixed(1));

    console.log('Base calculations:', { netAvailable, baseMonths, incomeEnabled, totalDays });

    // Calculate runway with income events only if income is enabled
    let withIncomeMonths = baseMonths;
    
    if (incomeEnabled && incomeEvents.length > 0) {
      console.log('Calculating with income events:', incomeEvents);
      let remainingSavings = netAvailable;
      const maxProjectionMonths = 60;
      let monthsCalculated = 0;

      console.log('Starting income calculation with savings:', remainingSavings);

      for (let month = 1; month <= maxProjectionMonths; month++) {
        // Subtract monthly expenses first
        remainingSavings -= monthlyExpenses;
        
        // Calculate current date for this projection month
        const currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() + month);
        
        // Calculate income for this month
        const monthlyIncome = incomeEvents.reduce((total, event) => {
          const eventDate = new Date(event.date);
          const eventMonth = eventDate.getFullYear() * 12 + eventDate.getMonth();
          const currentMonth = currentDate.getFullYear() * 12 + currentDate.getMonth();
          
          if (event.frequency === 'one-time' && eventMonth === currentMonth) {
            console.log(`One-time income in month ${month}:`, event.amount);
            return total + event.amount;
          } else if (event.frequency === 'monthly') {
            const endDate = event.endDate ? new Date(event.endDate) : null;
            if (eventMonth <= currentMonth && (!endDate || currentDate <= endDate)) {
              console.log(`Monthly income in month ${month}:`, event.amount);
              return total + event.amount;
            }
          } else if (event.frequency === 'yearly') {
            const eventAnnualDate = new Date(currentDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
            const timeDiff = Math.abs(eventAnnualDate.getTime() - currentDate.getTime());
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            if (daysDiff <= 15) { // Within 15 days of the annual date
              console.log(`Yearly income in month ${month}:`, event.amount);
              return total + event.amount;
            }
          }
          
          return total;
        }, 0);

        // Add income to remaining savings
        remainingSavings += monthlyIncome;
        monthsCalculated = month;

        console.log(`Month ${month}: expenses=${monthlyExpenses}, income=${monthlyIncome}, remaining=${remainingSavings}`);

        // If we run out of money, stop
        if (remainingSavings <= 0) {
          // Calculate fractional month based on how much we had left
          const previousBalance = remainingSavings - monthlyIncome + monthlyExpenses;
          const fractionOfMonth = previousBalance / monthlyExpenses;
          monthsCalculated = month - 1 + Math.max(0, fractionOfMonth);
          console.log(`Ran out of money. Final calculation: ${monthsCalculated}`);
          break;
        }
      }

      // If we still have money after max projection, set to max
      if (remainingSavings > 0) {
        monthsCalculated = maxProjectionMonths;
        console.log('Still have money after max projection, setting to 60 months');
      }

      withIncomeMonths = Number(monthsCalculated.toFixed(1));
      console.log('Final withIncomeMonths:', withIncomeMonths);
    }

    const additionalMonths = Math.max(0, withIncomeMonths - baseMonths);

    const finalRunway = {
      days: totalDays,
      months: baseMonths,
      withIncomeMonths,
      additionalMonthsFromIncome: additionalMonths,
    };

    console.log('=== FINAL RUNWAY CALCULATION ===', finalRunway);

    setRunway(finalRunway);
  };

  const handleCalculate = () => {
    calculateRunway();
    saveData();
    toast.success("Financial overview updated!");
  };

  const getTotalAssets = (): number => {
    let total = 0;
    if (!hiddenCategories.cash) {
      total += accountData.cash.reduce((sum, account) => sum + account.balance, 0);
    }
    if (!hiddenCategories.investments) {
      total += accountData.investments.reduce((sum, account) => sum + account.balance, 0);
    }
    if (!hiddenCategories.otherAssets) {
      total += accountData.otherAssets.reduce((sum, account) => sum + account.balance, 0);
    }
    return total;
  };

  const getTotalLiabilities = (): number => {
    let total = 0;
    if (!hiddenCategories.credit) {
      total += accountData.credit.reduce((sum, account) => sum + account.balance, 0);
    }
    if (!hiddenCategories.loans) {
      total += accountData.loans.reduce((sum, account) => sum + account.balance, 0);
    }
    return total;
  };

  const getDefaultAccountName = (category: keyof typeof accountData): string => {
    const categoryNames = {
      cash: 'Checking Account',
      investments: 'Investment Account',
      credit: 'Credit Card',
      loans: 'Personal Loan',
      otherAssets: 'Real Estate'
    };
    
    const existingCount = accountData[category].length;
    const baseName = categoryNames[category];
    
    if (existingCount === 0) {
      return baseName;
    }
    
    return `${baseName} ${existingCount + 1}`;
  };

  const addAccount = (category: keyof typeof accountData) => {
    const newAccount: AccountItem = {
      id: uuidv4(),
      name: getDefaultAccountName(category),
      balance: 0,
      interestRate: getDefaultInterestRate(category)
    };
    
    setAccountData(prev => ({
      ...prev,
      [category]: [...prev[category], newAccount]
    }));
  };

  const getDefaultInterestRate = (category: keyof typeof accountData): number => {
    const defaultRates = {
      cash: 0.5,
      investments: 8.0,
      credit: 24.99,
      loans: 7.5,
      otherAssets: 3.0
    };
    return defaultRates[category] || 0;
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully!");
  };

  const handleMassImport = (importedData: {
    accounts: {
      cash: AccountItem[];
      investments: AccountItem[];
      credit: AccountItem[];
      loans: AccountItem[];
      otherAssets: AccountItem[];
    };
    monthlyExpenses: number;
  }) => {
    // Assign new unique IDs to imported accounts to prevent duplicates
    const assignNewIds = (accounts: AccountItem[]): AccountItem[] => {
      return accounts.map(account => ({
        ...account,
        id: uuidv4()
      }));
    };

    setAccountData(prev => ({
      cash: [...prev.cash, ...assignNewIds(importedData.accounts.cash)],
      investments: [...prev.investments, ...assignNewIds(importedData.accounts.investments)],
      credit: [...prev.credit, ...assignNewIds(importedData.accounts.credit)],
      loans: [...prev.loans, ...assignNewIds(importedData.accounts.loans)],
      otherAssets: [...prev.otherAssets, ...assignNewIds(importedData.accounts.otherAssets)]
    }));

    if (importedData.monthlyExpenses > 0) {
      updateMonthlyExpenses(importedData.monthlyExpenses);
    }

    toast.success("Data imported successfully!");
  };

  const handleMassDelete = () => {
    if (window.confirm('Are you sure you want to delete ALL financial data? This cannot be undone.')) {
      setAccountData({
        cash: [],
        investments: [],
        credit: [],
        loans: [],
        otherAssets: []
      });
      updateMonthlyExpenses(0);
      // Clear income events through the hook's function
      removeIncomeEvent('all'); // This will be handled by the hook
      toast.success("All data cleared!");
    }
  };

  const handleCreateSnapshot = async (name: string, description?: string) => {
    console.log('Creating snapshot with name:', name, 'and description:', description);
    return await createSnapshot(name);
  };

  const handleRestoreFromSnapshot = (snapshotData: {
    accountData: {
      cash: AccountItem[];
      investments: AccountItem[];
      credit: AccountItem[];
      loans: AccountItem[];
      otherAssets: AccountItem[];
    };
    monthlyExpenses: number;
    incomeEvents?: IncomeEvent[];
    incomeEnabled?: boolean;
  }) => {
    restoreFromSnapshotData(snapshotData);
    toast.success("Financial data restored successfully!");
  };

  // Add update function for income events
  const updateIncomeEvent = (id: string, updatedEvent: Omit<IncomeEvent, 'id'>) => {
    // This would need to be implemented in the useFinancialData hook
    // For now, we'll remove and add (not ideal but functional)
    removeIncomeEvent(id);
    addIncomeEvent(updatedEvent);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6 shadow-lg bg-gradient-to-r from-blue-50 to-green-50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-blue-700 flex items-center">
                <Sparkles className="mr-2 text-yellow-500" /> 
                Financial Dashboard v1
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
                <Button onClick={handleSignOut} variant="outline" size="sm" className="flex items-center gap-2">
                  <LogOut size={16} />
                  Sign Out
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <DataRecoveryButton 
                onRefreshData={loadData}
                loading={loading}
                dataFound={dataFound}
                onShowSnapshots={() => setShowSnapshotViewer(true)}
              />
              <MassImportDialog onImport={handleMassImport} />
              <Button 
                onClick={handleMassDelete}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <Trash2 size={16} />
                Clear All Data
              </Button>
              <Button 
                onClick={() => setShowSnapshotViewer(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Camera size={16} />
                View Snapshots
              </Button>
            </div>
          </Card>

          <EnhancedSnapshotManager onCreateSnapshot={handleCreateSnapshot} onSaveData={saveData} />
          
          <DatabaseCleanupTool />
          
          <NetWorthSummary
            assets={getTotalAssets()} 
            liabilities={getTotalLiabilities()}
            incomeEvents={incomeEvents}
            incomeEnabled={incomeEnabled}
          />

          <IncomeManager 
            incomeEvents={incomeEvents}
            incomeEnabled={incomeEnabled}
            onAddIncomeEvent={addIncomeEvent}
            onRemoveIncomeEvent={removeIncomeEvent}
            onUpdateIncomeEvent={updateIncomeEvent}
            onToggleIncomeEnabled={() => updateIncomeEnabled(!incomeEnabled)}
          />

          <FinancialAllocationCharts 
            accountData={accountData} 
            monthlyExpenses={monthlyExpenses}
            incomeEvents={incomeEvents}
            incomeEnabled={incomeEnabled}
          />

          <PaymentTracker accountData={accountData} updateAccountField={updateAccountField} />
          
          <CreditCardDebtAnalyzer creditAccounts={accountData.credit} />
          
          <CreditScoreEstimator creditAccounts={accountData.credit} />
          
          <MonthlyExpensesManager 
            monthlyExpenses={monthlyExpenses}
            onUpdateMonthlyExpenses={updateMonthlyExpenses}
          />

          <div className="space-y-4">
            <AccountSection 
              title="Cash" 
              accounts={[...accountData.cash].sort((a, b) => b.balance - a.balance)}
              icon={<Wallet size={18} className="text-green-600" />}
              isHidden={hiddenCategories.cash}
              onAddAccount={() => addAccount('cash')}
              onUpdateAccount={() => {}}
              onUpdateAccountData={(id, updates) => updateAccountField('cash', id, updates)}
              onUpdateAccountName={(id, name) => updateAccountName('cash', id, name)}
              onRemoveAccount={(id) => {
                setAccountData(prev => ({
                  ...prev,
                  cash: prev.cash.filter(account => account.id !== id)
                }));
              }}
              onToggleHidden={() => setHiddenCategories(prev => ({ ...prev, cash: !prev.cash }))}
            />
            
            <AccountSection 
              title="Investments" 
              accounts={[...accountData.investments].sort((a, b) => b.balance - a.balance)}
              icon={<ChartPie size={18} className="text-blue-600" />}
              isHidden={hiddenCategories.investments}
              onAddAccount={() => addAccount('investments')}
              onUpdateAccount={() => {}}
              onUpdateAccountData={(id, updates) => updateAccountField('investments', id, updates)}
              onUpdateAccountName={(id, name) => updateAccountName('investments', id, name)}
              onRemoveAccount={(id) => {
                setAccountData(prev => ({
                  ...prev,
                  investments: prev.investments.filter(account => account.id !== id)
                }));
              }}
              onToggleHidden={() => setHiddenCategories(prev => ({ ...prev, investments: !prev.investments }))}
            />
            
            <AccountSection 
              title="Credit" 
              accounts={[...accountData.credit].sort((a, b) => b.balance - a.balance)}
              icon={<CreditCard size={18} className="text-red-600" />}
              isNegative={true}
              isHidden={hiddenCategories.credit}
              onAddAccount={() => addAccount('credit')}
              onUpdateAccount={() => {}}
              onUpdateAccountData={(id, updates) => updateAccountField('credit', id, updates)}
              onUpdateAccountName={(id, name) => updateAccountName('credit', id, name)}
              onRemoveAccount={(id) => {
                setAccountData(prev => ({
                  ...prev,
                  credit: prev.credit.filter(account => account.id !== id)
                }));
              }}
              onToggleHidden={() => setHiddenCategories(prev => ({ ...prev, credit: !prev.credit }))}
            />
            
            <AccountSection 
              title="Loans" 
              accounts={[...accountData.loans].sort((a, b) => b.balance - a.balance)}
              icon={<BadgeEuro size={18} className="text-orange-600" />}
              isNegative={true}
              isHidden={hiddenCategories.loans}
              onAddAccount={() => addAccount('loans')}
              onUpdateAccount={() => {}}
              onUpdateAccountData={(id, updates) => updateAccountField('loans', id, updates)}
              onUpdateAccountName={(id, name) => updateAccountName('loans', id, name)}
              onRemoveAccount={(id) => {
                setAccountData(prev => ({
                  ...prev,
                  loans: prev.loans.filter(account => account.id !== id)
                }));
              }}
              onToggleHidden={() => setHiddenCategories(prev => ({ ...prev, loans: !prev.loans }))}
            />
            
            <AccountSection 
              title="Other Assets" 
              accounts={[...accountData.otherAssets].sort((a, b) => b.balance - a.balance)}
              icon={<Coins size={18} className="text-purple-600" />}
              isHidden={hiddenCategories.otherAssets}
              onAddAccount={() => addAccount('otherAssets')}
              onUpdateAccount={() => {}}
              onUpdateAccountData={(id, updates) => updateAccountField('otherAssets', id, updates)}
              onUpdateAccountName={(id, name) => updateAccountName('otherAssets', id, name)}
              onRemoveAccount={(id) => {
                setAccountData(prev => ({
                  ...prev,
                  otherAssets: prev.otherAssets.filter(account => account.id !== id)
                }));
              }}
              onToggleHidden={() => setHiddenCategories(prev => ({ ...prev, otherAssets: !prev.otherAssets }))}
            />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <SnapshotChart />
          
          <FinancialInsights
            netWorth={getTotalAssets() - getTotalLiabilities()}
            totalAssets={getTotalAssets()}
            totalLiabilities={getTotalLiabilities()}
            runway={runway}
            creditAccounts={accountData.credit}
            monthlyExpenses={monthlyExpenses}
            incomeEnabled={incomeEnabled}
          />
          
          <GamificationCard
            netWorth={getTotalAssets() - getTotalLiabilities()}
            runway={runway.months}
            snapshotCount={3}
            totalAssets={getTotalAssets()}
          />
        </div>
      </div>

      {/* Runway Chart - Always visible at bottom */}
      <div className="mt-6">
        <RunwayChart 
          getTotalAssets={getTotalAssets}
          getTotalLiabilities={getTotalLiabilities}
          accountData={accountData}
          monthlyExpenses={monthlyExpenses}
          runway={runway}
          incomeEvents={incomeEvents}
          incomeEnabled={incomeEnabled}
          hiddenCategories={hiddenCategories}
        />
      </div>

      {/* Quest Journey - Always Open */}
      <div className="mt-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Financial Quest Journey</h3>
          </div>
          <FinancialQuestJourney
                  netWorth={getTotalAssets() - getTotalLiabilities()}
                  runway={runway.months}
                  totalAssets={getTotalAssets()}
                  totalLiabilities={getTotalLiabilities()}
                  creditCardDebt={accountData.credit.reduce((sum, acc) => sum + acc.balance, 0)}
                  monthlyObligations={
                    accountData.credit.reduce((sum, acc) => sum + (acc.minimumPayment || 0), 0) +
                    accountData.loans.reduce((sum, acc) => sum + (acc.minimumPayment || (acc.balance * 0.02)), 0)
                  }
                  paymentsCleared={0}
                  totalPayments={
                    accountData.credit.filter(acc => (acc.minimumPayment || 0) > 0).length +
                    accountData.loans.filter(acc => acc.balance > 0).length
                  }
                />
        </Card>
      </div>

      {/* Financial Archetype - Collapsible at bottom */}
      <div className="mt-6">
        <Card className="overflow-hidden">
          <Collapsible defaultOpen={true}>
            <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-primary animate-pulse" />
                  <h3 className="text-lg font-semibold">Financial Personality Traits</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full animate-pulse">
                    Discover your archetype
                  </span>
                </div>
                <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-6 pt-0 animate-fade-in">
                <FinancialArchetype
                  totalAssets={getTotalAssets()}
                  totalLiabilities={getTotalLiabilities()}
                  runway={runway.months}
                  monthlyExpenses={monthlyExpenses}
                  cashBalance={accountData.cash.reduce((sum, acc) => sum + acc.balance, 0)}
                  investmentBalance={accountData.investments.reduce((sum, acc) => sum + acc.balance, 0)}
                  creditBalance={accountData.credit.reduce((sum, acc) => sum + acc.balance, 0)}
                  accountCount={accountData.cash.length + accountData.investments.length + accountData.credit.length + accountData.loans.length + accountData.otherAssets.length}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>

      {showSnapshotViewer && (
        <SnapshotViewer 
          onClose={() => setShowSnapshotViewer(false)} 
          onRestoreSnapshot={handleRestoreFromSnapshot}
        />
      )}
    </div>
  );
};

export default RunwayCalculator;
