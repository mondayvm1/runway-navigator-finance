
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface AccountItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
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

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      // Load accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('user_id', user.id)
        .is('snapshot_id', null);

      if (accountsError) throw accountsError;

      // Group accounts by category
      const groupedAccounts: AccountData = {
        cash: [],
        investments: [],
        credit: [],
        loans: [],
        otherAssets: []
      };

      accounts?.forEach(account => {
        const accountItem: AccountItem = {
          id: account.account_id,
          name: account.name,
          balance: Number(account.balance),
          interestRate: 0 // Default, will be enhanced later
        };

        if (account.category in groupedAccounts) {
          groupedAccounts[account.category as keyof AccountData].push(accountItem);
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

      if (expensesError) throw expensesError;

      if (expenses) {
        setMonthlyExpenses(Number(expenses.amount));
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load financial data');
    }
  };

  const saveData = async () => {
    if (!user) return;

    try {
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
            is_hidden: hiddenCategories[category as keyof HiddenCategories]
          });
        });
      });

      // Delete existing accounts for this user (not snapshots)
      await supabase
        .from('user_accounts')
        .delete()
        .eq('user_id', user.id)
        .is('snapshot_id', null);

      // Insert new accounts
      if (accountsToSave.length > 0) {
        const { error: accountsError } = await supabase
          .from('user_accounts')
          .insert(accountsToSave);

        if (accountsError) throw accountsError;
      }

      // Save monthly expenses
      await supabase
        .from('monthly_expenses')
        .delete()
        .eq('user_id', user.id)
        .is('snapshot_id', null);

      const { error: expensesError } = await supabase
        .from('monthly_expenses')
        .insert({
          user_id: user.id,
          amount: monthlyExpenses
        });

      if (expensesError) throw expensesError;

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
  };
};
