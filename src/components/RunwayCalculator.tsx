import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import RunwayChart from "./RunwayChart";
import NetWorthSummary from "./NetWorthSummary";
import AccountSection from "./AccountSection";
import SnapshotManager from "./SnapshotManager";
import SnapshotChart from "./SnapshotChart";
import GamificationCard from "./GamificationCard";
import DataRecoveryButton from "./DataRecoveryButton";
import MassImportDialog from "./MassImportDialog";
import { Clock, DollarSign, CalendarDays, Landmark, Wallet, CreditCard, Coins, BadgeEuro, ChartPie, LogOut, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/hooks/useAuth';
import { useFinancialData, AccountItem } from '@/hooks/useFinancialData';

const RunwayCalculator = () => {
  const { user, signOut } = useAuth();
  const {
    accountData,
    setAccountData,
    monthlyExpenses,
    setMonthlyExpenses,
    hiddenCategories,
    setHiddenCategories,
    saveData,
    createSnapshot,
    updateAccountName,
    loading,
    dataFound,
    loadData,
  } = useFinancialData();

  const [runway, setRunway] = useState({
    days: 0,
    months: 0,
  });

  useEffect(() => {
    calculateRunway();
  }, [accountData, monthlyExpenses, hiddenCategories]);

  const calculateRunway = () => {
    if (monthlyExpenses <= 0) {
      setRunway({ days: 0, months: 0 });
      return;
    }

    const totalCash = accountData.cash.reduce((sum, account) => sum + account.balance, 0);
    const dailyExpenses = monthlyExpenses / 30;
    const totalDays = Math.floor(totalCash / dailyExpenses);
    const totalMonths = (totalCash / monthlyExpenses).toFixed(1);

    setRunway({
      days: totalDays,
      months: parseFloat(totalMonths),
    });
  };

  const handleCalculate = () => {
    calculateRunway();
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

  const updateAccount = (category: keyof typeof accountData, id: string, balance: number) => {
    setAccountData(prev => ({
      ...prev,
      [category]: prev[category].map(account => 
        account.id === id ? { ...account, balance } : account
      )
    }));
  };

  const updateAccountInterestRate = (category: keyof typeof accountData, id: string, interestRate: number) => {
    setAccountData(prev => ({
      ...prev,
      [category]: prev[category].map(account => 
        account.id === id ? { ...account, interestRate } : account
      )
    }));
  };

  const handleUpdateAccountName = (category: keyof typeof accountData, id: string, name: string) => {
    updateAccountName(category, id, name);
  };

  const removeAccount = (category: keyof typeof accountData, id: string) => {
    setAccountData(prev => ({
      ...prev,
      [category]: prev[category].filter(account => account.id !== id)
    }));
  };

  const toggleCategoryHidden = (category: keyof typeof hiddenCategories) => {
    setHiddenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
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
    // Merge imported data with existing data
    setAccountData(prev => ({
      cash: [...prev.cash, ...importedData.accounts.cash],
      investments: [...prev.investments, ...importedData.accounts.investments],
      credit: [...prev.credit, ...importedData.accounts.credit],
      loans: [...prev.loans, ...importedData.accounts.loans],
      otherAssets: [...prev.otherAssets, ...importedData.accounts.otherAssets]
    }));

    if (importedData.monthlyExpenses > 0) {
      setMonthlyExpenses(importedData.monthlyExpenses);
    }

    // Auto-save after import
    setTimeout(() => {
      saveData();
    }, 100);
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
      setMonthlyExpenses(0);
      toast.success("All data cleared!");
      // Auto-save after delete
      setTimeout(() => {
        saveData();
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-2">Personal Finance Dashboard</h1>
          <p className="text-xl text-gray-600">Track your complete financial picture</p>
        </header>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card className="p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-blue-700 flex items-center">
                    <Landmark className="mr-2" /> Financial Overview
                  </h2>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
                    <Button onClick={handleSignOut} variant="outline" size="sm" className="flex items-center gap-2">
                      <LogOut size={16} />
                      Sign Out
                    </Button>
                  </div>
                </div>
                
                <div className="mb-6 flex items-center gap-4">
                  <DataRecoveryButton 
                    onRefreshData={loadData}
                    loading={loading}
                    dataFound={dataFound}
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
                </div>
                
                <SnapshotManager onCreateSnapshot={createSnapshot} onSaveData={saveData} />
                
                <SnapshotChart />
                
                <div className="mb-6">
                  <NetWorthSummary 
                    assets={getTotalAssets()} 
                    liabilities={getTotalLiabilities()}
                  />
                </div>
                
                <div className="space-y-4 mb-6">
                  <AccountSection 
                    title="Cash" 
                    accounts={accountData.cash}
                    icon={<Wallet size={18} className="text-green-600" />}
                    isHidden={hiddenCategories.cash}
                    onAddAccount={() => addAccount('cash')}
                    onUpdateAccount={(id, balance) => updateAccount('cash', id, balance)}
                    onUpdateAccountName={(id, name) => handleUpdateAccountName('cash', id, name)}
                    onUpdateInterestRate={(id, rate) => updateAccountInterestRate('cash', id, rate)}
                    onRemoveAccount={(id) => removeAccount('cash', id)}
                    onToggleHidden={() => toggleCategoryHidden('cash')}
                  />
                  
                  <AccountSection 
                    title="Investments" 
                    accounts={accountData.investments}
                    icon={<ChartPie size={18} className="text-blue-600" />}
                    isHidden={hiddenCategories.investments}
                    onAddAccount={() => addAccount('investments')}
                    onUpdateAccount={(id, balance) => updateAccount('investments', id, balance)}
                    onUpdateAccountName={(id, name) => handleUpdateAccountName('investments', id, name)}
                    onUpdateInterestRate={(id, rate) => updateAccountInterestRate('investments', id, rate)}
                    onRemoveAccount={(id) => removeAccount('investments', id)}
                    onToggleHidden={() => toggleCategoryHidden('investments')}
                  />
                  
                  <AccountSection 
                    title="Credit" 
                    accounts={accountData.credit}
                    icon={<CreditCard size={18} className="text-red-600" />}
                    isNegative={true}
                    isHidden={hiddenCategories.credit}
                    onAddAccount={() => addAccount('credit')}
                    onUpdateAccount={(id, balance) => updateAccount('credit', id, balance)}
                    onUpdateAccountName={(id, name) => handleUpdateAccountName('credit', id, name)}
                    onUpdateInterestRate={(id, rate) => updateAccountInterestRate('credit', id, rate)}
                    onRemoveAccount={(id) => removeAccount('credit', id)}
                    onToggleHidden={() => toggleCategoryHidden('credit')}
                  />
                  
                  <AccountSection 
                    title="Loans" 
                    accounts={accountData.loans}
                    icon={<BadgeEuro size={18} className="text-orange-600" />}
                    isNegative={true}
                    isHidden={hiddenCategories.loans}
                    onAddAccount={() => addAccount('loans')}
                    onUpdateAccount={(id, balance) => updateAccount('loans', id, balance)}
                    onUpdateAccountName={(id, name) => handleUpdateAccountName('loans', id, name)}
                    onUpdateInterestRate={(id, rate) => updateAccountInterestRate('loans', id, rate)}
                    onRemoveAccount={(id) => removeAccount('loans', id)}
                    onToggleHidden={() => toggleCategoryHidden('loans')}
                  />
                  
                  <AccountSection 
                    title="Other Assets" 
                    accounts={accountData.otherAssets}
                    icon={<Coins size={18} className="text-purple-600" />}
                    isHidden={hiddenCategories.otherAssets}
                    onAddAccount={() => addAccount('otherAssets')}
                    onUpdateAccount={(id, balance) => updateAccount('otherAssets', id, balance)}
                    onUpdateAccountName={(id, name) => handleUpdateAccountName('otherAssets', id, name)}
                    onUpdateInterestRate={(id, rate) => updateAccountInterestRate('otherAssets', id, rate)}
                    onRemoveAccount={(id) => removeAccount('otherAssets', id)}
                    onToggleHidden={() => toggleCategoryHidden('otherAssets')}
                  />
                  
                  <div>
                    <label htmlFor="monthlyExpenses" className="block text-sm font-medium text-gray-700 mb-1">
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
                        onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mb-8">
                  <Button onClick={handleCalculate} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Update Overview
                  </Button>
                </div>
                
                {(runway.days > 0 || runway.months > 0) && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-3">Financial Runway</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="flex justify-center mb-2">
                          <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="text-sm text-gray-500">Runway in Days</div>
                        <div className="text-3xl font-bold text-blue-700">{runway.days}</div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="flex justify-center mb-2">
                          <CalendarDays className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="text-sm text-gray-500">Runway in Months</div>
                        <div className="text-3xl font-bold text-green-700">{runway.months}</div>
                      </div>
                    </div>
                    
                    <RunwayChart 
                      savings={accountData.cash.reduce((sum, account) => sum + account.balance, 0)} 
                      monthlyExpenses={monthlyExpenses} 
                      months={runway.months} 
                    />
                  </div>
                )}
              </Card>
            </div>
            <div className="space-y-4">
              <GamificationCard
                netWorth={getTotalAssets() - getTotalLiabilities()}
                runway={runway.months}
                snapshotCount={3}
                totalAssets={getTotalAssets()}
              />
              {/* ... keep existing InfoCard components */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunwayCalculator;
