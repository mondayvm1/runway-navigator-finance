
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import RunwayChart from "./RunwayChart";
import NetWorthSummary from "./NetWorthSummary";
import AccountSection, { AccountItem } from "./AccountSection";
import { Clock, DollarSign, CalendarDays, Landmark, Wallet, CreditCard, Coins, BadgeEuro, ChartPie } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

interface AccountData {
  cash: AccountItem[];
  investments: AccountItem[];
  credit: AccountItem[];
  loans: AccountItem[];
  otherAssets: AccountItem[];
}

const defaultAccountData: AccountData = {
  cash: [{ id: uuidv4(), name: "Checking", balance: 1500 }],
  investments: [{ id: uuidv4(), name: "Brokerage", balance: 5000 }],
  credit: [{ id: uuidv4(), name: "Credit Card", balance: 2500 }],
  loans: [{ id: uuidv4(), name: "Student Loan", balance: 15000 }],
  otherAssets: [{ id: uuidv4(), name: "Car", balance: 12000 }],
};

const RunwayCalculator = () => {
  const [accountData, setAccountData] = useState<AccountData>(defaultAccountData);
  const [monthlyExpenses, setMonthlyExpenses] = useState(2500);
  const [runway, setRunway] = useState({
    days: 0,
    months: 0,
  });

  useEffect(() => {
    // Load saved data from localStorage when component mounts
    const savedData = localStorage.getItem("financeRunwayData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setAccountData(parsedData.accountData || defaultAccountData);
        setMonthlyExpenses(parsedData.monthlyExpenses || 2500);
        calculateRunway(parsedData.accountData || defaultAccountData, parsedData.monthlyExpenses || 2500);
      } catch (error) {
        console.error("Error parsing saved data:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Save data to localStorage whenever it changes
    localStorage.setItem("financeRunwayData", JSON.stringify({
      accountData,
      monthlyExpenses
    }));
  }, [accountData, monthlyExpenses]);

  const calculateRunway = (accounts: AccountData, expenses: number) => {
    if (expenses <= 0) {
      setRunway({ days: 0, months: 0 });
      return;
    }

    const totalCash = accounts.cash.reduce((sum, account) => sum + account.balance, 0);
    const dailyExpenses = expenses / 30;
    const totalDays = Math.floor(totalCash / dailyExpenses);
    const totalMonths = (totalCash / expenses).toFixed(1);

    setRunway({
      days: totalDays,
      months: parseFloat(totalMonths),
    });
  };

  const handleCalculate = () => {
    calculateRunway(accountData, monthlyExpenses);
    toast.success("Financial overview updated!");
  };

  const handleReset = () => {
    setAccountData(defaultAccountData);
    setMonthlyExpenses(2500);
    calculateRunway(defaultAccountData, 2500);
    toast.info("Values have been reset");
  };

  const getTotalAssets = (): number => {
    const cashTotal = accountData.cash.reduce((sum, account) => sum + account.balance, 0);
    const investmentsTotal = accountData.investments.reduce((sum, account) => sum + account.balance, 0);
    const otherAssetsTotal = accountData.otherAssets.reduce((sum, account) => sum + account.balance, 0);
    return cashTotal + investmentsTotal + otherAssetsTotal;
  };

  const getTotalLiabilities = (): number => {
    const creditTotal = accountData.credit.reduce((sum, account) => sum + account.balance, 0);
    const loansTotal = accountData.loans.reduce((sum, account) => sum + account.balance, 0);
    return creditTotal + loansTotal;
  };

  const addAccount = (category: keyof AccountData, defaultName: string = "New Account") => {
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

  const updateAccount = (category: keyof AccountData, id: string, balance: number) => {
    setAccountData(prev => ({
      ...prev,
      [category]: prev[category].map(account => 
        account.id === id ? { ...account, balance } : account
      )
    }));
  };

  return (
    <Card className="p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-blue-700 flex items-center">
        <Landmark className="mr-2" /> Financial Overview
      </h2>
      
      <NetWorthSummary 
        assets={getTotalAssets()} 
        liabilities={getTotalLiabilities()}
      />
      
      <div className="space-y-4 mb-6">
        <AccountSection 
          title="Cash" 
          accounts={accountData.cash}
          icon={<Wallet size={18} className="text-green-600" />}
          onAddAccount={() => addAccount('cash', 'New Cash Account')}
          onUpdateAccount={(id, balance) => updateAccount('cash', id, balance)}
        />
        
        <AccountSection 
          title="Investments" 
          accounts={accountData.investments}
          icon={<ChartPie size={18} className="text-blue-600" />}
          onAddAccount={() => addAccount('investments', 'New Investment')}
          onUpdateAccount={(id, balance) => updateAccount('investments', id, balance)}
        />
        
        <AccountSection 
          title="Credit" 
          accounts={accountData.credit}
          icon={<CreditCard size={18} className="text-red-600" />}
          isNegative={true}
          onAddAccount={() => addAccount('credit', 'New Credit Card')}
          onUpdateAccount={(id, balance) => updateAccount('credit', id, balance)}
        />
        
        <AccountSection 
          title="Loans" 
          accounts={accountData.loans}
          icon={<BadgeEuro size={18} className="text-orange-600" />}
          isNegative={true}
          onAddAccount={() => addAccount('loans', 'New Loan')}
          onUpdateAccount={(id, balance) => updateAccount('loans', id, balance)}
        />
        
        <AccountSection 
          title="Other Assets" 
          accounts={accountData.otherAssets}
          icon={<Coins size={18} className="text-purple-600" />}
          onAddAccount={() => addAccount('otherAssets', 'New Asset')}
          onUpdateAccount={(id, balance) => updateAccount('otherAssets', id, balance)}
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
        <Button onClick={handleReset} variant="outline" className="flex-1">
          Reset
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
