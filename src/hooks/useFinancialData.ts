import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { IncomeEvent } from '@/components/IncomeManager';
import { useIncomeEvents } from './useIncomeEvents';
import { useIncomeSettings } from './useIncomeSettings';

export interface AccountItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  creditLimit?: number;
  dueDate?: string;
  minimumPayment?: number;
  statementDate?: number;
  autopayEnabled?: boolean;
  autopayAmountType?: 'MINIMUM' | 'FULL_BALANCE' | 'CUSTOM';
  autopayCustomAmount?: number;
  isPaidOff?: boolean;
  reportsToExperian?: boolean;
  reportsToTransunion?: boolean;
  reportsToEquifax?: boolean;
  reportingDay?: number;
}

export interface AccountData {
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
  const {
    incomeEvents,
    loading: incomeEventsLoading,
    addIncomeEvent,
    removeIncomeEvent,
    reloadEvents: reloadIncomeEvents,
  } = useIncomeEvents();
  const {
    incomeEnabled,
    loading: incomeSettingsLoading,
    updateIncomeEnabled,
  } = useIncomeSettings();
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
      // Ensure accounts is an array
      const accountsArray = Array.isArray(accounts) ? accounts : [];
      accountsArray.forEach(account => {
        const accountItem: AccountItem = {
          id: account.account_id,
          name: account.name,
          balance: Number(account.balance),
          interestRate: Number(account.interest_rate || 0),
          creditLimit: account.credit_limit ? Number(account.credit_limit) : undefined,
          dueDate: account.due_date || undefined,
          minimumPayment: account.minimum_payment ? Number(account.minimum_payment) : undefined,
          statementDate: account.statement_date ?? undefined,
          autopayEnabled: account.autopay_enabled ?? false,
          autopayAmountType: (account.autopay_amount_type as 'MINIMUM' | 'FULL_BALANCE' | 'CUSTOM') || 'MINIMUM',
          autopayCustomAmount: account.autopay_custom_amount ? Number(account.autopay_custom_amount) : undefined,
          isPaidOff: account.is_paid_off ?? false,
          reportsToExperian: account.reports_to_experian ?? true,
          reportsToTransunion: account.reports_to_transunion ?? true,
          reportsToEquifax: account.reports_to_equifax ?? true,
          reportingDay: account.reporting_day ?? undefined,
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
            is_hidden: hiddenCategories[category as keyof HiddenCategories],
            statement_date: account.statementDate || null,
            autopay_enabled: account.autopayEnabled ?? false,
            autopay_amount_type: account.autopayAmountType || 'MINIMUM',
            autopay_custom_amount: account.autopayCustomAmount || null,
            is_paid_off: account.isPaidOff ?? false,
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
      const accountEntries = Object.entries(accountData);
      accountEntries.forEach(([category, accounts]) => {
        const accountsArr = Array.isArray(accounts) ? accounts : [];
        accountsArr.forEach(account => {
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
            snapshot_id: snapshot?.id,
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

  const updateAccountField = async (
    category: keyof AccountData,
    id: string,
    updates: Partial<AccountItem>
  ) => {
    if (!user) return;
    // Find the account
    const account = accountData[category].find((a) => a.id === id);
    if (!account) return;
    
    // Map camelCase properties to snake_case database columns
    const dbUpdates: any = {};
    
    if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
    if (updates.interestRate !== undefined) dbUpdates.interest_rate = updates.interestRate;
    if (updates.creditLimit !== undefined) dbUpdates.credit_limit = updates.creditLimit;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.minimumPayment !== undefined) dbUpdates.minimum_payment = updates.minimumPayment;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.statementDate !== undefined) dbUpdates.statement_date = updates.statementDate;
    if (updates.autopayEnabled !== undefined) dbUpdates.autopay_enabled = updates.autopayEnabled;
    if (updates.autopayAmountType !== undefined) dbUpdates.autopay_amount_type = updates.autopayAmountType;
    if (updates.autopayCustomAmount !== undefined) dbUpdates.autopay_custom_amount = updates.autopayCustomAmount;
    if (updates.isPaidOff !== undefined) dbUpdates.is_paid_off = updates.isPaidOff;
    if (updates.reportsToExperian !== undefined) dbUpdates.reports_to_experian = updates.reportsToExperian;
    if (updates.reportsToTransunion !== undefined) dbUpdates.reports_to_transunion = updates.reportsToTransunion;
    if (updates.reportsToEquifax !== undefined) dbUpdates.reports_to_equifax = updates.reportsToEquifax;
    if (updates.reportingDay !== undefined) dbUpdates.reporting_day = updates.reportingDay;
    
    // Debug logging
    console.log('Updating account:', { dbUpdates, id, userId: user.id });
    
    // Update Supabase
    try {
      const { error } = await supabase
        .from('user_accounts')
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('account_id', id)
        .is('snapshot_id', null);
      if (error) throw error;
      // Update local state
      setAccountData((prev) => ({
        ...prev,
        [category]: prev[category].map((a) =>
          a.id === id ? { ...a, ...updates } : a
        ),
      }));
      toast.success('Account updated!');
    } catch (e) {
      toast.error('Failed to update account');
      console.error('Update account error:', e);
    }
  };

  const updateMonthlyExpenses = async (amount: number) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('monthly_expenses')
        .upsert({
          user_id: user.id,
          amount,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
      setMonthlyExpenses(amount);
      toast.success('Monthly expenses updated!');
    } catch (e) {
      toast.error('Failed to update expenses');
      console.error(e);
    }
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
      // This part is now handled by the useIncomeEvents hook
    }
    
    // Restore income enabled setting if provided
    if (snapshotData.incomeEnabled !== undefined) {
      // This part is now handled by the useIncomeSettings hook
    }
    
    setDataFound(true);
    console.log('Data restored from snapshot:', snapshotData);
  };

  return {
    accountData,
    setAccountData,
    monthlyExpenses,
    setMonthlyExpenses,
    incomeEvents,
    incomeEnabled,
    updateIncomeEnabled,
    addIncomeEvent,
    removeIncomeEvent,
    updateAccountField,
    updateMonthlyExpenses,
    hiddenCategories,
    setHiddenCategories,
    saveData,
    createSnapshot,
    updateAccountName,
    updateAccountInterestRate,
    loading: loading || incomeEventsLoading || incomeSettingsLoading,
    dataFound,
    loadData,
    restoreFromSnapshotData,
  };
};
