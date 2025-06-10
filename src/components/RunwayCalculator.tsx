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
import SnapshotViewer from "./SnapshotViewer";
import { Clock, DollarSign, CalendarDays, Landmark, Wallet, CreditCard, Coins, BadgeEuro, ChartPie, LogOut, Trash2, Camera } from "lucide-react";
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

  const [showSnapshotViewer, setShowSnapshotViewer] = useState(false);

  useEffect(() => {
    calculateRunway();
  }, [accountData, monthlyExpenses, hiddenCategories]);

  // Auto-save data whenever it changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user && (accountData.cash.length > 0 || accountData.investments.length > 0 || 
          accountData.credit.length > 0 || accountData.loans.length > 0 || 
          accountData.otherAssets.length > 0 || monthlyExpenses > 0)) {
        saveData();
      }
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [accountData, monthlyExpenses, hiddenCategories, user, saveData]);

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
    saveData(); // Save data when user clicks calculate
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

    // Auto-save will trigger from the useEffect
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
      setMonthlyExpenses(0);
      toast.success("All data cleared!");
      // Auto-save will trigger from the useEffect
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Content - Takes up 3 columns */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header Section */}
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
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
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

          {/* Snapshot Management */}
          <SnapshotManager onCreateSnapshot={createSnapshot} onSaveData={saveData} />
          
          {/* Net Worth Summary */}
          <NetWorthSummary 
            assets={getTotalAssets()} 
            liabilities={getTotalLiabilities()}
          />

          {/* Financial Progress Chart - Moved here to make it bigger */}
          <SnapshotChart />
          
          {/* Monthly Expenses */}
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
                  onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value) || 0)}
                />
              </div>
              <Button onClick={handleCalculate} className="w-full bg-blue-600 hover:bg-blue-700">
                Update Overview
              </Button>
            </div>
          </Card>

          {/* Account Sections */}
          <div className="space-y-4">
            <AccountSection 
              title="Cash" 
              accounts={accountData.cash}
              icon={<Wallet size={18} className="text-green-600" />}
              isHidden={hiddenCategories.cash}
              onAddAccount={() => addAccount('cash')}
              onUpdateAccount={(id, balance) => updateAccount('cash', id, balance)}
              onUpdateAccountName={(id, name) => handleUpdateAccountName('cash', id, name)}
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
              onRemoveAccount={(id) => removeAccount('otherAssets', id)}
              onToggleHidden={() => toggleCategoryHidden('otherAssets')}
            />
          </div>

          {/* Runway Results */}
          {(runway.days > 0 || runway.months > 0) && (
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Financial Runway</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
            </Card>
          )}
        </div>

        {/* Right Sidebar - Takes up 1 column */}
        <div className="lg:col-span-1 space-y-4">
          <GamificationCard
            netWorth={getTotalAssets() - getTotalLiabilities()}
            runway={runway.months}
            snapshotCount={3}
            totalAssets={getTotalAssets()}
          />
        </div>
      </div>

      {/* Snapshot Viewer Modal */}
      {showSnapshotViewer && (
        <SnapshotViewer onClose={() => setShowSnapshotViewer(false)} />
      )}
    </div>
  );
};

export default RunwayCalculator;
