
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import RunwayChart from "./RunwayChart";
import NetWorthSummary from "./NetWorthSummary";
import AccountSection, { AccountItem } from "./AccountSection";
import SnapshotManager from "./SnapshotManager";
import { Clock, DollarSign, CalendarDays, Landmark, Wallet, CreditCard, Coins, BadgeEuro, ChartPie, LogOut } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/hooks/useAuth';
import { useFinancialData } from '@/hooks/useFinancialData';

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

  const addAccount = (category: keyof typeof accountData, defaultName: string = "New Account") => {
    const newAccount: AccountItem = {
      id: uuidv4(),
      name: defaultName,
      balance: 0
    };
    
    setAccountData(prev => ({
      ...prev,
      [category]: [...prev[category], newAccount]
    }));
  };

  const updateAccount = (category: keyof typeof accountData, id: string, balance: number) => {
    setAccountData(prev => ({
      ...prev,
      [category]: prev[category].map(account => 
        account.id === id ? { ...account, balance } : account
      )
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

  return (
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
      
      <SnapshotManager onCreateSnapshot={createSnapshot} onSaveData={saveData} />
      
      <NetWorthSummary 
        assets={getTotalAssets()} 
        liabilities={getTotalLiabilities()}
      />
      
      <div className="space-y-4 mb-6">
        <AccountSection 
          title="Cash" 
          accounts={accountData.cash}
          icon={<Wallet size={18} className="text-green-600" />}
          isHidden={hiddenCategories.cash}
          onAddAccount={() => addAccount('cash', 'New Cash Account')}
          onUpdateAccount={(id, balance) => updateAccount('cash', id, balance)}
          onToggleHidden={() => toggleCategoryHidden('cash')}
        />
        
        <AccountSection 
          title="Investments" 
          accounts={accountData.investments}
          icon={<ChartPie size={18} className="text-blue-600" />}
          isHidden={hiddenCategories.investments}
          onAddAccount={() => addAccount('investments', 'New Investment')}
          onUpdateAccount={(id, balance) => updateAccount('investments', id, balance)}
          onToggleHidden={() => toggleCategoryHidden('investments')}
        />
        
        <AccountSection 
          title="Credit" 
          accounts={accountData.credit}
          icon={<CreditCard size={18} className="text-red-600" />}
          isNegative={true}
          isHidden={hiddenCategories.credit}
          onAddAccount={() => addAccount('credit', 'New Credit Card')}
          onUpdateAccount={(id, balance) => updateAccount('credit', id, balance)}
          onToggleHidden={() => toggleCategoryHidden('credit')}
        />
        
        <AccountSection 
          title="Loans" 
          accounts={accountData.loans}
          icon={<BadgeEuro size={18} className="text-orange-600" />}
          isNegative={true}
          isHidden={hiddenCategories.loans}
          onAddAccount={() => addAccount('loans', 'New Loan')}
          onUpdateAccount={(id, balance) => updateAccount('loans', id, balance)}
          onToggleHidden={() => toggleCategoryHidden('loans')}
        />
        
        <AccountSection 
          title="Other Assets" 
          accounts={accountData.otherAssets}
          icon={<Coins size={18} className="text-purple-600" />}
          isHidden={hiddenCategories.otherAssets}
          onAddAccount={() => addAccount('otherAssets', 'New Asset')}
          onUpdateAccount={(id, balance) => updateAccount('otherAssets', id, balance)}
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
  );
};

export default RunwayCalculator;
