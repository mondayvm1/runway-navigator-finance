import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { IncomeEvent } from '@/components/IncomeManager';

export interface AccountItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  creditLimit?: number;
  dueDate?: string;
  minimumPayment?: number;
}

interface AccountData {
  cash: AccountItem[];
  investments: AccountItem[];
  credit: AccountItem[];
  loans: AccountItem[];
  otherAssets: AccountItem[];
}

interface HiddenCategories {
  cash: boolean;
  investments: boolean;
  credit: boolean;
  loans: boolean;
  otherAssets: boolean;
}

export const useFinancialData = () => {
  const { user } = useAuth();
  const [accountData, setAccountData] = useState<AccountData>({
    cash: [],
    investments: [],
    credit: [],
    loans: [],
    otherAssets: []
  });
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(0);
  const [incomeEvents, setIncomeEvents] = useState<IncomeEvent[]>([]);
  const [incomeEnabled, setIncomeEnabled] = useState<boolean>(true);
  const [hiddenCategories, setHiddenCategories] = useState<HiddenCategories>({
    cash: false,
    investments: false,
    credit: false,
    loans: false,
    otherAssets: false
  });
  const [loading, setLoading] = useState(false);
  const [dataFound, setDataFound] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    console.log('Loading financial data for user:', user.id);

    try {
      // Load accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('user_id', user.id)
        .is('snapshot_id', null);

      if (accountsError) {
        console.error('Error loading accounts:', accountsError);
        throw accountsError;
      }

      const groupedAccounts: AccountData = {
        cash: [],
        investments: [],
        credit: [],
        loans: [],
        otherAssets: []
      };

      let totalAccounts = 0;
      accounts?.forEach(account => {
        const accountItem: AccountItem = {
          id: account.account_id,
          name: account.name,
          balance: Number(account.balance),
          interestRate: Number(account.interest_rate || 0),
          creditLimit: account.credit_limit ? Number(account.credit_limit) : undefined,
          dueDate: account.due_date || undefined,
          minimumPayment: account.minimum_payment ? Number(account.minimum_payment) : undefined
        };

        if (account.category in groupedAccounts) {
          groupedAccounts[account.category as keyof AccountData].push(accountItem);
          totalAccounts++;
        }
      });

      setAccountData(groupedAccounts);

      // Load monthly expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('monthly_expenses')
        .select('amount')
        .eq('user_id', user.id)
        .is('snapshot_id', null)
        .maybeSingle();

      if (expensesError) {
        console.error('Error loading expenses:', expensesError);
        throw expensesError;
      }

      if (expenses) {
        setMonthlyExpenses(Number(expenses.amount));
      }

      // Load income events and settings from localStorage
      loadIncomeData();

      setDataFound(totalAccounts > 0);

      if (totalAccounts > 0 || expenses) {
        toast.success(`Data recovered! Found ${totalAccounts} accounts and ${expenses ? 'monthly expenses' : 'no monthly expenses'}`);
      } else {
        const { data: snapshots } = await supabase
          .from('financial_snapshots')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (snapshots && snapshots.length > 0) {
          toast.info('No current data found, but snapshots are available for recovery. Use "View Snapshots" to restore your data.');
        } else {
          toast.info('No previous data found. You can start entering your financial information.');
        }
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load financial data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadIncomeData = () => {
    if (!user) return;
    
    // Load income events from localStorage
    const savedIncomeEvents = localStorage.getItem(`income_events_${user.id}`);
    const savedIncomeEnabled = localStorage.getItem(`income_enabled_${user.id}`);
    
    if (savedIncomeEvents) {
      try {
        const parsed = JSON.parse(savedIncomeEvents);
        setIncomeEvents(parsed);
      } catch (e) {
        console.error('Error parsing saved income events:', e);
      }
    }

    if (savedIncomeEnabled !== null) {
      setIncomeEnabled(savedIncomeEnabled === 'true');
    }
  };

  const saveIncomeEvents = (events: IncomeEvent[]) => {
    if (user) {
      localStorage.setItem(`income_events_${user.id}`, JSON.stringify(events));
      console.log('Saved income events:', events);
    }
  };

  const saveIncomeEnabled = (enabled: boolean) => {
    if (user) {
      localStorage.setItem(`income_enabled_${user.id}`, enabled.toString());
      console.log('Saved income enabled:', enabled);
    }
  };

  const addIncomeEvent = (event: Omit<IncomeEvent, 'id'>) => {
    const newEvent: IncomeEvent = {
      ...event,
      id: crypto.randomUUID()
    };
    const updatedEvents = [...incomeEvents, newEvent].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setIncomeEvents(updatedEvents);
    saveIncomeEvents(updatedEvents);
    toast.success('Income event added successfully!');
  };

  const removeIncomeEvent = (id: string) => {
    if (id === 'all') {
      // Clear all income events
      const updatedEvents: IncomeEvent[] = [];
      setIncomeEvents(updatedEvents);
      saveIncomeEvents(updatedEvents);
      toast.success('All income events cleared!');
    } else {
      const updatedEvents = incomeEvents.filter(event => event.id !== id);
      setIncomeEvents(updatedEvents);
      saveIncomeEvents(updatedEvents);
      toast.success('Income event removed successfully!');
    }
  };

  const toggleIncomeEnabled = () => {
    const newEnabled = !incomeEnabled;
    setIncomeEnabled(newEnabled);
    saveIncomeEnabled(newEnabled);
    toast.success(`Income planning ${newEnabled ? 'enabled' : 'disabled'}`);
  };

  const restoreFromSnapshotData = (snapshotData: {
    accountData: AccountData;
    monthlyExpenses: number;
    incomeEvents?: IncomeEvent[];
    incomeEnabled?: boolean;
  }) => {
    setAccountData(snapshotData.accountData);
    setMonthlyExpenses(snapshotData.monthlyExpenses);
    
    // Restore income events if provided, otherwise keep current ones
    if (snapshotData.incomeEvents !== undefined) {
      setIncomeEvents(snapshotData.incomeEvents);
      if (user) {
        saveIncomeEvents(snapshotData.incomeEvents);
      }
    }
    
    // Restore income enabled setting if provided
    if (snapshotData.incomeEnabled !== undefined) {
      setIncomeEnabled(snapshotData.incomeEnabled);
      if (user) {
        saveIncomeEnabled(snapshotData.incomeEnabled);
      }
    }
    
    setDataFound(true);
    console.log('Data restored from snapshot:', snapshotData);
  };

  const saveData = async () => {
    if (!user) return;

    try {
      console.log('Saving financial data...');
      
      const accountsToSave = [];
      Object.entries(accountData).forEach(([category, accounts]) => {
        accounts.forEach(account => {
          accountsToSave.push({
            user_id: user.id,
            account_id: account.id,
            name: account.name,
            category: category,
            balance: account.balance,
            interest_rate: account.interestRate,
            credit_limit: account.creditLimit || null,
            due_date: account.dueDate || null,
            minimum_payment: account.minimumPayment || null,
            is_hidden: hiddenCategories[category as keyof HiddenCategories]
          });
        });
      });

      console.log('Accounts to save:', accountsToSave);

      const { error: deleteError } = await supabase
        .from('user_accounts')
        .delete()
        .eq('user_id', user.id)
        .is('snapshot_id', null);

      if (deleteError) {
        console.error('Error deleting existing accounts:', deleteError);
        throw deleteError;
      }

      if (accountsToSave.length > 0) {
        const { error: accountsError } = await supabase
          .from('user_accounts')
          .insert(accountsToSave);

        if (accountsError) {
          console.error('Error inserting accounts:', accountsError);
          throw accountsError;
        }
      }

      const { error: deleteExpensesError } = await supabase
        .from('monthly_expenses')
        .delete()
        .eq('user_id', user.id)
        .is('snapshot_id', null);

      if (deleteExpensesError) {
        console.error('Error deleting existing expenses:', deleteExpensesError);
        throw deleteExpensesError;
      }

      const { error: expensesError } = await supabase
        .from('monthly_expenses')
        .insert({
          user_id: user.id,
          amount: monthlyExpenses
        });

      if (expensesError) {
        console.error('Error inserting expenses:', expensesError);
        throw expensesError;
      }

      console.log('Data saved successfully');
      toast.success('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Failed to save data');
    }
  };

  const createSnapshot = async (name: string) => {
    if (!user) return;

    try {
      const { data: snapshot, error: snapshotError } = await supabase
        .from('financial_snapshots')
        .insert({
          user_id: user.id,
          name: name
        })
        .select()
        .single();

      if (snapshotError) throw snapshotError;

      const accountsToSave = [];
      Object.entries(accountData).forEach(([category, accounts]) => {
        accounts.forEach(account => {
          accountsToSave.push({
            user_id: user.id,
            account_id: account.id,
            name: account.name,
            category: category,
            balance: account.balance,
            interest_rate: account.interestRate,
            credit_limit: account.creditLimit || null,
            due_date: account.dueDate || null,
            minimum_payment: account.minimumPayment || null,
            snapshot_id: snapshot.id,
            is_hidden: hiddenCategories[category as keyof HiddenCategories]
          });
        });
      });

      if (accountsToSave.length > 0) {
        const { error: accountsError } = await supabase
          .from('user_accounts')
          .insert(accountsToSave);

        if (accountsError) throw accountsError;
      }

      const { error: expensesError } = await supabase
        .from('monthly_expenses')
        .insert({
          user_id: user.id,
          amount: monthlyExpenses,
          snapshot_id: snapshot.id
        });

      if (expensesError) throw expensesError;

      // Save current income state to localStorage with snapshot reference
      const snapshotIncomeKey = `snapshot_income_${snapshot.id}`;
      localStorage.setItem(snapshotIncomeKey, JSON.stringify({
        events: incomeEvents,
        enabled: incomeEnabled
      }));

      toast.success(`Snapshot "${name}" created successfully!`);
      return snapshot.id;
    } catch (error) {
      console.error('Error creating snapshot:', error);
      toast.error('Failed to create snapshot');
    }
  };

  const updateAccountName = (category: keyof AccountData, id: string, name: string) => {
    setAccountData(prev => ({
      ...prev,
      [category]: prev[category].map(account => 
        account.id === id ? { ...account, name } : account
      )
    }));
  };

  const updateAccountInterestRate = (category: keyof AccountData, id: string, rate: number) => {
    setAccountData(prev => ({
      ...prev,
      [category]: prev[category].map(account => 
        account.id === id ? { ...account, interestRate: rate } : account
      )
    }));
    console.log(`Updated interest rate for ${id} to ${rate}%`);
  };

  return {
    accountData,
    setAccountData,
    monthlyExpenses,
    setMonthlyExpenses,
    incomeEvents,
    setIncomeEvents,
    incomeEnabled,
    toggleIncomeEnabled,
    addIncomeEvent,
    removeIncomeEvent,
    hiddenCategories,
    setHiddenCategories,
    saveData,
    createSnapshot,
    updateAccountName,
    updateAccountInterestRate,
    loading,
    dataFound,
    loadData,
    restoreFromSnapshotData,
  };
};
