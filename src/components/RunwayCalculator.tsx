
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { toast } from "@/components/ui/use-toast"
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSnapshot as createSnapshotAction,
  saveData as saveDataAction,
  loadSnapshot as loadSnapshotAction,
  deleteSnapshot as deleteSnapshotAction,
  fetchSnapshots as fetchSnapshotsAction,
} from '@/actions/snapshot-actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Snapshot } from '@/types';
import SnapshotManager from './SnapshotManager';
import CollapsibleCashSection from './CollapsibleCashSection';

interface Account {
  name: string;
  balance: number;
}

interface MonthlyExpense {
  name: string;
  amount: number;
}

const RunwayCalculator = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [accountData, setAccountData] = useState({
    cash: [] as Account[],
    investments: [] as Account[],
    monthlyExpenses: [] as MonthlyExpense[],
    monthlyIncome: 0,
    creditCardDebt: 0,
  });

  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [runway, setRunway] = useState<number | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const response = await fetch(`/api/user-data?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setAccountData(data);
          } else {
            console.error('Failed to fetch user data:', response.status);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (user && accountData) {
      queryClient.prefetchQuery({
        queryKey: ['snapshots', user.id],
        queryFn: () => fetchSnapshotsAction(user.id as string),
      });
    }
  }, [user, accountData, queryClient]);

  const { data: snapshots, isLoading: isSnapshotsLoading, refetch: refetchSnapshots } = useQuery({
    queryKey: ['snapshots', user?.id],
    queryFn: () => fetchSnapshotsAction(user?.id as string),
    enabled: !!user?.id,
  });

  const saveDataMutation = useMutation({
    mutationFn: saveDataAction,
    onSuccess: () => {
      toast({
        title: "Data Saved!",
        description: "Your data has been successfully saved.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error saving data",
        description: "Something went wrong. Please try again.",
      })
      console.error("Save data failed:", error);
    },
  });

  const createSnapshotMutation = useMutation({
    mutationFn: createSnapshotAction,
    onSuccess: () => {
      toast({
        title: "Snapshot Created!",
        description: "Your snapshot has been successfully created.",
      })
      refetchSnapshots();
    },
    onError: (error) => {
      toast({
        title: "Error creating snapshot",
        description: "Something went wrong. Please try again.",
      })
      console.error("Create snapshot failed:", error);
    },
  });

  const loadSnapshotMutation = useMutation({
    mutationFn: loadSnapshotAction,
    onSuccess: (data) => {
      setAccountData(data || {
        cash: [],
        investments: [],
        monthlyExpenses: [],
        monthlyIncome: 0,
        creditCardDebt: 0,
      });
      toast({
        title: "Snapshot Loaded!",
        description: "Your snapshot has been successfully loaded.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error loading snapshot",
        description: "Something went wrong. Please try again.",
      })
      console.error("Load snapshot failed:", error);
    },
  });

  const deleteSnapshotMutation = useMutation({
    mutationFn: deleteSnapshotAction,
    onSuccess: () => {
      toast({
        title: "Snapshot Deleted!",
        description: "Your snapshot has been successfully deleted.",
      })
      refetchSnapshots();
    },
    onError: (error) => {
      toast({
        title: "Error deleting snapshot",
        description: "Something went wrong. Please try again.",
      })
      console.error("Delete snapshot failed:", error);
    },
  });

  const handleAddCashAccount = (name: string, balance: number) => {
    const newAccount = { name, balance };
    setAccountData(prev => ({
      ...prev,
      cash: [...prev.cash, newAccount]
    }));
  };

  const handleUpdateCashAccount = (index: number, name: string, balance: number) => {
    setAccountData(prev => ({
      ...prev,
      cash: prev.cash.map((account, i) => 
        i === index ? { name, balance } : account
      )
    }));
  };

  const handleRemoveCashAccount = (index: number) => {
    setAccountData(prev => ({
      ...prev,
      cash: prev.cash.filter((_, i) => i !== index)
    }));
  };

  const handleAddInvestment = (name: string, balance: number) => {
    const newInvestment = { name, balance };
    setAccountData(prev => ({
      ...prev,
      investments: [...prev.investments, newInvestment]
    }));
  };

  const handleUpdateInvestment = (index: number, name: string, balance: number) => {
    setAccountData(prev => ({
      ...prev,
      investments: prev.investments.map((investment, i) =>
        i === index ? { name, balance } : investment
      )
    }));
  };

  const handleRemoveInvestment = (index: number) => {
    setAccountData(prev => ({
      ...prev,
      investments: prev.investments.filter((_, i) => i !== index)
    }));
  };

  const handleAddExpense = (name: string, amount: number) => {
    const newExpense = { name, amount };
    setAccountData(prev => ({
      ...prev,
      monthlyExpenses: [...prev.monthlyExpenses, newExpense]
    }));
  };

  const handleUpdateExpense = (index: number, name: string, amount: number) => {
    setAccountData(prev => ({
      ...prev,
      monthlyExpenses: prev.monthlyExpenses.map((expense, i) =>
        i === index ? { name, amount } : expense
      )
    }));
  };

  const handleRemoveExpense = (index: number) => {
    setAccountData(prev => ({
      ...prev,
      monthlyExpenses: prev.monthlyExpenses.filter((_, i) => i !== index)
    }));
  };

  const calculateRunway = useCallback(() => {
    if (!accountData) return null;

    const totalCash = accountData.cash.reduce((sum, account) => sum + account.balance, 0);
    const totalInvestments = accountData.investments.reduce((sum, investment) => sum + investment.balance, 0);
    const totalExpenses = accountData.monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    const netWorth = totalCash + totalInvestments - accountData.creditCardDebt;
    const monthlyBurnRate = totalExpenses - accountData.monthlyIncome;

    if (monthlyBurnRate <= 0) {
      return null;
    }

    return netWorth / monthlyBurnRate;
  }, [accountData]);

  useEffect(() => {
    setRunway(calculateRunway());
  }, [accountData, calculateRunway]);

  const handleMonthlyIncomeChange = (value: number) => {
    setAccountData(prev => ({ ...prev, monthlyIncome: value }));
  };

  const handleCreditCardDebtChange = (value: number) => {
    setAccountData(prev => ({ ...prev, creditCardDebt: value }));
  };

  const handleCreateSnapshot = async (name: string): Promise<string> => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to save data.",
      })
      throw new Error("Not authenticated");
    }

    return await createSnapshotMutation.mutateAsync({
      userId: user.id,
      snapshotName: name,
      accountData: accountData,
    });
  };

  const handleSaveData = async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to save data.",
      })
      return;
    }

    await saveDataMutation.mutateAsync({ userId: user.id, accountData });
  };

  const handleLoadSnapshot = async (snapshot: Snapshot) => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to load a snapshot.",
      })
      return;
    }

    await loadSnapshotMutation.mutateAsync({ userId: user.id, snapshotId: snapshot.id });
  };

  const handleDeleteSnapshot = async (snapshot: Snapshot) => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to delete a snapshot.",
      })
      return;
    }

    await deleteSnapshotMutation.mutateAsync({ userId: user.id, snapshotId: snapshot.id });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SnapshotManager
        onCreateSnapshot={handleCreateSnapshot}
        onSaveData={handleSaveData}
      />

      <Card className="shadow-xl bg-white border-0">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">Financial Runway</CardTitle>
        </CardHeader>
        <CardContent>
          {runway !== null ? (
            <div className="text-center p-6 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-xl">
              <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {runway === Infinity
                  ? 'Unlimited'
                  : runway < 0
                    ? 'Less than a month'
                    : `${runway.toFixed(1)} Months`}
              </p>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">Enter your data to calculate your financial runway.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <CollapsibleCashSection
            accounts={accountData.cash}
            onAddAccount={handleAddCashAccount}
            onUpdateAccount={handleUpdateCashAccount}
            onRemoveAccount={handleRemoveCashAccount}
          />

          <Card className="shadow-lg bg-white border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-800">Investments</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {accountData.investments.map((investment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border mb-2">
                  <Input
                    value={investment.name}
                    onChange={(e) => handleUpdateInvestment(index, e.target.value, investment.balance)}
                    className="flex-1 mr-2 bg-transparent border-0 font-medium text-gray-800"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={investment.balance}
                      onChange={(e) => handleUpdateInvestment(index, investment.name, parseFloat(e.target.value) || 0)}
                      className="w-28 bg-transparent border-0 text-right font-semibold text-gray-800"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveInvestment(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddInvestment('New Investment', 0)}
                className="w-full mt-4 border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Add Investment
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-white border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-800">Monthly Expenses</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {accountData.monthlyExpenses.map((expense, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border mb-2">
                  <Input
                    value={expense.name}
                    onChange={(e) => handleUpdateExpense(index, e.target.value, expense.amount)}
                    className="flex-1 mr-2 bg-transparent border-0 font-medium text-gray-800"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={expense.amount}
                      onChange={(e) => handleUpdateExpense(index, expense.name, parseFloat(e.target.value) || 0)}
                      className="w-28 bg-transparent border-0 text-right font-semibold text-gray-800"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExpense(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddExpense('New Expense', 0)}
                className="w-full mt-4 border-2 border-dashed border-red-300 text-red-600 hover:bg-red-50"
              >
                Add Expense
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg bg-white border-0">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Income Manager</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="monthlyIncome" className="text-gray-700">Monthly Income</Label>
                <Input
                  type="number"
                  id="monthlyIncome"
                  value={accountData.monthlyIncome}
                  onChange={(e) => handleMonthlyIncomeChange(parseFloat(e.target.value) || 0)}
                  className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-white border-0">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Credit Card Debt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="creditCardDebt" className="text-gray-700">Credit Card Debt</Label>
                <Input
                  type="number"
                  id="creditCardDebt"
                  value={accountData.creditCardDebt}
                  onChange={(e) => handleCreditCardDebtChange(parseFloat(e.target.value) || 0)}
                  className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Snapshots</CardTitle>
        </CardHeader>
        <CardContent>
          {isSnapshotsLoading ? (
            <div>Loading snapshots...</div>
          ) : snapshots && snapshots.length > 0 ? (
            <Accordion type="single" collapsible>
              {snapshots.map((snapshot) => (
                <AccordionItem key={snapshot.id} value={snapshot.id}>
                  <AccordionTrigger>{snapshot.snapshotName} - {new Date(snapshot.createdAt).toLocaleDateString()}</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex justify-between">
                      <Button size="sm" onClick={() => handleLoadSnapshot(snapshot)}>Load Snapshot</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteSnapshot(snapshot)}>Delete</Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div>No snapshots available.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Start Date</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>
    </div>
  );
};

export default RunwayCalculator;
