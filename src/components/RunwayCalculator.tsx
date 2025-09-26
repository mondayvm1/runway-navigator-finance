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
import { Clock, DollarSign, CalendarDays, Landmark, Wallet, CreditCard, Coins, BadgeEuro, ChartPie, LogOut, Trash2, Camera, Sparkles, TrendingUp } from "lucide-react";
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
    setAccountData(prev => ({
      cash: [...prev.cash, ...importedData.accounts.cash],
      investments: [...prev.investments, ...importedData.accounts.investments],
      credit: [...prev.credit, ...importedData.accounts.credit],
      loans: [...prev.loans, ...importedData.accounts.loans],
      otherAssets: [...prev.otherAssets, ...importedData.accounts.otherAssets]
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
          
          <Card className="p-6">
            <div className="space-y-4">
              <label htmlFor="monthlyExpenses" className="block text-lg font-medium text-gray-700">
                Monthly Expenses
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="monthlyExpenses"
                  name="monthlyExpenses"
                  type="number"
                  min="0"
                  className="pl-10"
                  placeholder="Enter your monthly expenses"
                  value={monthlyExpenses || ""}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : Number(e.target.value);
                    updateMonthlyExpenses(value);
                  }}
                />
              </div>
              <Button onClick={handleCalculate} className="w-full bg-blue-600 hover:bg-blue-700">
                Update Overview
              </Button>
            </div>
          </Card>

          <FinancialAllocationCharts 
            accountData={accountData}
            monthlyExpenses={monthlyExpenses}
            incomeEvents={incomeEvents}
            incomeEnabled={incomeEnabled}
          />

          <div className="space-y-4">
            <AccountSection 
              title="Cash" 
              accounts={accountData.cash}
              icon={<Wallet size={18} className="text-green-600" />}
              isHidden={hiddenCategories.cash}
              onAddAccount={() => addAccount('cash')}
              onUpdateAccount={() => {}}
              onUpdateAccountData={(id, updates) => updateAccountField('cash', id, updates)}
              onUpdateAccountName={(id, name) => updateAccountName('cash', id, name)}
              onRemoveAccount={async (id) => {
                // Remove from backend
                await updateAccountField('cash', id, { balance: 0, name: '', interestRate: 0 });
                // Remove from local state
                setAccountData(prev => ({
                  ...prev,
                  cash: prev.cash.filter(account => account.id !== id)
                }));
              }}
              onToggleHidden={() => setHiddenCategories(prev => ({ ...prev, cash: !prev.cash }))}
            />
            
            <AccountSection 
              title="Investments" 
              accounts={accountData.investments}
              icon={<ChartPie size={18} className="text-blue-600" />}
              isHidden={hiddenCategories.investments}
              onAddAccount={() => addAccount('investments')}
              onUpdateAccount={() => {}}
              onUpdateAccountData={(id, updates) => updateAccountField('investments', id, updates)}
              onUpdateAccountName={(id, name) => updateAccountName('investments', id, name)}
              onRemoveAccount={async (id) => {
                await updateAccountField('investments', id, { balance: 0, name: '', interestRate: 0 });
                setAccountData(prev => ({
                  ...prev,
                  investments: prev.investments.filter(account => account.id !== id)
                }));
              }}
              onToggleHidden={() => setHiddenCategories(prev => ({ ...prev, investments: !prev.investments }))}
            />
            
            <AccountSection 
              title="Credit" 
              accounts={accountData.credit}
              icon={<CreditCard size={18} className="text-red-600" />}
              isNegative={true}
              isHidden={hiddenCategories.credit}
              onAddAccount={() => addAccount('credit')}
              onUpdateAccount={() => {}}
              onUpdateAccountData={(id, updates) => updateAccountField('credit', id, updates)}
              onUpdateAccountName={(id, name) => updateAccountName('credit', id, name)}
              onRemoveAccount={async (id) => {
                await updateAccountField('credit', id, { balance: 0, name: '', interestRate: 0 });
                setAccountData(prev => ({
                  ...prev,
                  credit: prev.credit.filter(account => account.id !== id)
                }));
              }}
              onToggleHidden={() => setHiddenCategories(prev => ({ ...prev, credit: !prev.credit }))}
            />
            
            <AccountSection 
              title="Loans" 
              accounts={accountData.loans}
              icon={<BadgeEuro size={18} className="text-orange-600" />}
              isNegative={true}
              isHidden={hiddenCategories.loans}
              onAddAccount={() => addAccount('loans')}
              onUpdateAccount={() => {}}
              onUpdateAccountData={(id, updates) => updateAccountField('loans', id, updates)}
              onUpdateAccountName={(id, name) => updateAccountName('loans', id, name)}
              onRemoveAccount={async (id) => {
                await updateAccountField('loans', id, { balance: 0, name: '', interestRate: 0 });
                setAccountData(prev => ({
                  ...prev,
                  loans: prev.loans.filter(account => account.id !== id)
                }));
              }}
              onToggleHidden={() => setHiddenCategories(prev => ({ ...prev, loans: !prev.loans }))}
            />
            
            <AccountSection 
              title="Other Assets" 
              accounts={accountData.otherAssets}
              icon={<Coins size={18} className="text-purple-600" />}
              isHidden={hiddenCategories.otherAssets}
              onAddAccount={() => addAccount('otherAssets')}
              onUpdateAccount={() => {}}
              onUpdateAccountData={(id, updates) => updateAccountField('otherAssets', id, updates)}
              onUpdateAccountName={(id, name) => updateAccountName('otherAssets', id, name)}
              onRemoveAccount={async (id) => {
                await updateAccountField('otherAssets', id, { balance: 0, name: '', interestRate: 0 });
                setAccountData(prev => ({
                  ...prev,
                  otherAssets: prev.otherAssets.filter(account => account.id !== id)
                }));
              }}
              onToggleHidden={() => setHiddenCategories(prev => ({ ...prev, otherAssets: !prev.otherAssets }))}
            />
          </div>

          {(runway.days > 0 || runway.months > 0) && (
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Financial Runway & Projections</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="flex justify-center mb-2">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-sm text-gray-500">Runway in Days</div>
                  <div className="text-2xl font-bold text-blue-700">{runway.days}</div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="flex justify-center mb-2">
                    <CalendarDays className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-sm text-gray-500">Without Income</div>
                  <div className="text-2xl font-bold text-orange-700">{runway.months}</div>
                </div>

                <div className={`p-4 rounded-lg text-center transition-all ${
                  incomeEnabled ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <div className="flex justify-center mb-2">
                    <TrendingUp className={`h-6 w-6 ${incomeEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div className={`text-sm ${incomeEnabled ? 'text-gray-500' : 'text-gray-400'}`}>
                    With Income
                  </div>
                  <div className={`text-2xl font-bold ${incomeEnabled ? 'text-green-700' : 'text-gray-500'}`}>
                    {incomeEnabled ? (runway.withIncomeMonths >= 60 ? '60+' : runway.withIncomeMonths) : runway.months}
                  </div>
                  {!incomeEnabled && (
                    <div className="text-xs text-gray-400 mt-1">Disabled</div>
                  )}
                </div>

                <div className={`p-4 rounded-lg text-center transition-all ${
                  incomeEnabled ? 'bg-purple-50' : 'bg-gray-50'
                }`}>
                  <div className="flex justify-center mb-2">
                    <Sparkles className={`h-6 w-6 ${incomeEnabled ? 'text-purple-600' : 'text-gray-400'}`} />
                  </div>
                  <div className={`text-sm ${incomeEnabled ? 'text-gray-500' : 'text-gray-400'}`}>
                    Extra Months
                  </div>
                  <div className={`text-2xl font-bold ${incomeEnabled ? 'text-purple-700' : 'text-gray-500'}`}>
                    {incomeEnabled ? (runway.additionalMonthsFromIncome >= 60 ? '60+' : runway.additionalMonthsFromIncome.toFixed(1)) : '0'}
                  </div>
                  {!incomeEnabled && (
                    <div className="text-xs text-gray-400 mt-1">Disabled</div>
                  )}
                </div>
              </div>
              
              <EnhancedRunwayChart 
                savings={accountData.cash.reduce((sum, account) => sum + account.balance, 0)} 
                monthlyExpenses={monthlyExpenses} 
                months={runway.months}
                incomeEvents={incomeEvents}
                incomeEnabled={incomeEnabled}
              />
            </Card>
          )}
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
