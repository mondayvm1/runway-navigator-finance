
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface AccountItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  // Credit card specific fields
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
      // Load accounts with detailed logging
      const { data: accounts, error: accountsError } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('user_id', user.id)
        .is('snapshot_id', null);

      if (accountsError) {
        console.error('Error loading accounts:', accountsError);
        throw accountsError;
      }

      console.log('Loaded accounts:', accounts);

      // Group accounts by category
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
          interestRate: 0, // Default, will be enhanced later
          // Credit card specific fields
          creditLimit: account.credit_limit ? Number(account.credit_limit) : undefined,
          dueDate: account.due_date || undefined,
          minimumPayment: account.minimum_payment ? Number(account.minimum_payment) : undefined
        };

        if (account.category in groupedAccounts) {
          groupedAccounts[account.category as keyof AccountData].push(accountItem);
          totalAccounts++;
        }
      });

      console.log('Grouped accounts:', groupedAccounts);
      console.log('Total accounts found:', totalAccounts);

      setAccountData(groupedAccounts);
      setDataFound(totalAccounts > 0);

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

      console.log('Loaded expenses:', expenses);

      if (expenses) {
        setMonthlyExpenses(Number(expenses.amount));
        console.log('Monthly expenses set to:', Number(expenses.amount));
      }

      // Show recovery status
      if (totalAccounts > 0 || expenses) {
        toast.success(`Data recovered! Found ${totalAccounts} accounts and ${expenses ? 'monthly expenses' : 'no monthly expenses'}`);
      } else {
        toast.info('No previous data found. You can start entering your financial information.');
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load financial data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    if (!user) return;

    try {
      console.log('Saving financial data...');
      
      // Save accounts
      const accountsToSave = [];
      Object.entries(accountData).forEach(([category, accounts]) => {
        accounts.forEach(account => {
          accountsToSave.push({
            user_id: user.id,
            account_id: account.id,
            name: account.name,
            category: category,
            balance: account.balance,
            credit_limit: account.creditLimit || null,
            due_date: account.dueDate || null,
            minimum_payment: account.minimumPayment || null,
            is_hidden: hiddenCategories[category as keyof HiddenCategories]
          });
        });
      });

      console.log('Accounts to save:', accountsToSave);

      // Delete existing accounts for this user (not snapshots)
      const { error: deleteError } = await supabase
        .from('user_accounts')
        .delete()
        .eq('user_id', user.id)
        .is('snapshot_id', null);

      if (deleteError) {
        console.error('Error deleting existing accounts:', deleteError);
        throw deleteError;
      }

      // Insert new accounts
      if (accountsToSave.length > 0) {
        const { error: accountsError } = await supabase
          .from('user_accounts')
          .insert(accountsToSave);

        if (accountsError) {
          console.error('Error inserting accounts:', accountsError);
          throw accountsError;
        }
      }

      // Save monthly expenses
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
      // Create snapshot record
      const { data: snapshot, error: snapshotError } = await supabase
        .from('financial_snapshots')
        .insert({
          user_id: user.id,
          name: name
        })
        .select()
        .single();

      if (snapshotError) throw snapshotError;

      // Save current accounts to snapshot
      const accountsToSave = [];
      Object.entries(accountData).forEach(([category, accounts]) => {
        accounts.forEach(account => {
          accountsToSave.push({
            user_id: user.id,
            account_id: account.id,
            name: account.name,
            category: category,
            balance: account.balance,
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

      // Save monthly expenses to snapshot
      const { error: expensesError } = await supabase
        .from('monthly_expenses')
        .insert({
          user_id: user.id,
          amount: monthlyExpenses,
          snapshot_id: snapshot.id
        });

      if (expensesError) throw expensesError;

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

  return {
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
    loadData, // Expose loadData for manual refresh
  };
};
