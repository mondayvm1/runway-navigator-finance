
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { AccountItem } from '@/components/AccountSection';
import { toast } from 'sonner';

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
    otherAssets: [],
  });
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [hiddenCategories, setHiddenCategories] = useState<HiddenCategories>({
    cash: false,
    investments: false,
    credit: false,
    loans: false,
    otherAssets: false,
  });
  const [currentSnapshotId, setCurrentSnapshotId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadCurrentSnapshot();
    }
  }, [user]);

  const loadCurrentSnapshot = async () => {
    if (!user) return;

    try {
      // Get the most recent snapshot or create one if none exists
      let { data: snapshots, error } = await supabase
        .from('financial_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      let snapshotId: string;
      
      if (!snapshots || snapshots.length === 0) {
        // Create initial snapshot
        const { data: newSnapshot, error: createError } = await supabase
          .from('financial_snapshots')
          .insert({
            user_id: user.id,
            name: 'Current Financial State'
          })
          .select()
          .single();

        if (createError) throw createError;
        snapshotId = newSnapshot.id;
      } else {
        snapshotId = snapshots[0].id;
      }

      setCurrentSnapshotId(snapshotId);
      await loadSnapshotData(snapshotId);
    } catch (error) {
      console.error('Error loading snapshot:', error);
      toast.error('Failed to load financial data');
    }
  };

  const loadSnapshotData = async (snapshotId: string) => {
    if (!user) return;

    try {
      // Load accounts
      const { data: accounts, error: accountsError } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('snapshot_id', snapshotId);

      if (accountsError) throw accountsError;

      // Load monthly expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('monthly_expenses')
        .select('*')
        .eq('snapshot_id', snapshotId)
        .single();

      if (expensesError && expensesError.code !== 'PGRST116') throw expensesError;

      // Transform accounts data
      const transformedData: AccountData = {
        cash: [],
        investments: [],
        credit: [],
        loans: [],
        otherAssets: [],
      };

      accounts?.forEach(account => {
        const accountItem: AccountItem = {
          id: account.account_id,
          name: account.name,
          balance: Number(account.balance),
        };
        transformedData[account.category as keyof AccountData].push(accountItem);
      });

      setAccountData(transformedData);
      setMonthlyExpenses(expenses ? Number(expenses.amount) : 0);
    } catch (error) {
      console.error('Error loading snapshot data:', error);
      toast.error('Failed to load snapshot data');
    }
  };

  const saveData = async () => {
    if (!user || !currentSnapshotId) return;

    try {
      // Delete existing accounts for this snapshot
      await supabase
        .from('user_accounts')
        .delete()
        .eq('snapshot_id', currentSnapshotId);

      // Insert new accounts
      const accountsToInsert = Object.entries(accountData).flatMap(([category, accounts]) =>
        accounts.map(account => ({
          user_id: user.id,
          snapshot_id: currentSnapshotId,
          account_id: account.id,
          name: account.name,
          balance: account.balance,
          category,
        }))
      );

      if (accountsToInsert.length > 0) {
        const { error: accountsError } = await supabase
          .from('user_accounts')
          .insert(accountsToInsert);

        if (accountsError) throw accountsError;
      }

      // Update monthly expenses
      const { error: expensesError } = await supabase
        .from('monthly_expenses')
        .upsert({
          user_id: user.id,
          snapshot_id: currentSnapshotId,
          amount: monthlyExpenses,
        });

      if (expensesError) throw expensesError;

      toast.success('Financial data saved!');
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Failed to save financial data');
    }
  };

  const createSnapshot = async (name: string) => {
    if (!user) return;

    try {
      const { data: newSnapshot, error } = await supabase
        .from('financial_snapshots')
        .insert({
          user_id: user.id,
          name,
        })
        .select()
        .single();

      if (error) throw error;

      // Copy current data to new snapshot
      const accountsToInsert = Object.entries(accountData).flatMap(([category, accounts]) =>
        accounts.map(account => ({
          user_id: user.id,
          snapshot_id: newSnapshot.id,
          account_id: account.id,
          name: account.name,
          balance: account.balance,
          category,
        }))
      );

      if (accountsToInsert.length > 0) {
        await supabase.from('user_accounts').insert(accountsToInsert);
      }

      await supabase.from('monthly_expenses').insert({
        user_id: user.id,
        snapshot_id: newSnapshot.id,
        amount: monthlyExpenses,
      });

      toast.success(`Snapshot "${name}" created!`);
      return newSnapshot.id;
    } catch (error) {
      console.error('Error creating snapshot:', error);
      toast.error('Failed to create snapshot');
    }
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
    currentSnapshotId,
  };
};
