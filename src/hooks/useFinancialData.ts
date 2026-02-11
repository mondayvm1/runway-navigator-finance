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
    console.log('🔄 ===== LOADING FINANCIAL DATA =====');
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

      console.log('📦 Loaded accounts from DB:', accounts?.length || 0);

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
      
      // Deduplicate accounts by content (name + category + balance) to prevent duplicates
      // This handles cases where account_id might be null or different but accounts are the same
      const seenAccounts = new Map<string, any>();
      const uniqueAccounts = accountsArray.filter((account: any) => {
        const category = account.category || account.type || 'cash';
        // Create a unique key based on account content, not just ID
        const contentKey = `${category}|${account.name}|${account.balance}|${account.interest_rate || 0}|${account.credit_limit || 0}`;
        
        // If we've seen this exact account before, skip it (keep the first one)
        if (seenAccounts.has(contentKey)) {
          console.warn('⚠️ Duplicate account found (by content):', account.name, category, account.balance);
          return false;
        }
        
        seenAccounts.set(contentKey, account);
        return true;
      });
      
      console.log('✅ Unique accounts after deduplication:', uniqueAccounts.length, 'out of', accountsArray.length);
      
      // If we found duplicates, clean them up from the database
      if (uniqueAccounts.length < accountsArray.length) {
        const duplicateIds = accountsArray
          .filter(acc => {
            const category = acc.category || acc.type || 'cash';
            const contentKey = `${category}|${acc.name}|${acc.balance}|${acc.interest_rate || 0}|${acc.credit_limit || 0}`;
            return !seenAccounts.has(contentKey) || seenAccounts.get(contentKey)?.id !== acc.id;
          })
          .map(acc => acc.id);
        
        if (duplicateIds.length > 0) {
          console.log('🧹 Cleaning up', duplicateIds.length, 'duplicate accounts from database...');
          await supabase
            .from('user_accounts')
            .delete()
            .in('id', duplicateIds);
          console.log('✅ Duplicates cleaned up');
        }
      }
      
      uniqueAccounts.forEach((account: any) => {
        const accountItem: AccountItem = {
          id: account.account_id || account.id,
          name: account.name,
          balance: Number(account.balance),
          interestRate: Number(account.interest_rate || 0),
          creditLimit: account.credit_limit ? Number(account.credit_limit) : undefined,
          dueDate: account.due_date?.toString() || undefined,
          minimumPayment: account.min_payment ? Number(account.min_payment) : undefined,
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

        const category = account.category || account.type;
        if (category in groupedAccounts) {
          groupedAccounts[category as keyof AccountData].push(accountItem);
          totalAccounts++;
        }
      });

      setAccountData(groupedAccounts);

      // Load monthly expenses
      console.log('💰 ===== LOADING MONTHLY EXPENSES =====');
      
      // Get all expenses first to debug
      const { data: allExpenses, error: checkError } = await supabase
        .from('monthly_expenses')
        .select('id, amount, snapshot_id, name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      console.log('🔍 All monthly expenses in DB:', JSON.stringify(allExpenses, null, 2));
      
      if (checkError) {
        console.error('❌ Error checking expenses:', checkError);
      }
      
      // Find the most recent expense with snapshot_id IS NULL
      // Check for null, undefined, or empty string (some databases might store empty string)
      const currentExpense = allExpenses?.find(exp => 
        exp.snapshot_id === null || 
        exp.snapshot_id === undefined || 
        exp.snapshot_id === ''
      );
      
      console.log('📊 Current expense (snapshot_id IS NULL):', JSON.stringify(currentExpense, null, 2));
      
      if (currentExpense) {
        const amount = Number(currentExpense.amount);
        console.log('✅ ===== SETTING MONTHLY EXPENSES TO:', amount, '=====');
        setMonthlyExpenses(amount);
      } else {
        console.log('⚠️ ===== NO MONTHLY EXPENSES FOUND WITH snapshot_id IS NULL =====');
        if (allExpenses && allExpenses.length > 0) {
          console.log('Available expenses:', allExpenses.map(e => ({ 
            id: e.id, 
            amount: e.amount, 
            snapshot_id: e.snapshot_id, 
            snapshot_id_type: typeof e.snapshot_id,
            name: e.name 
          })));
        } else {
          console.log('No expenses found in database at all');
        }
        setMonthlyExpenses(0);
      }
      console.log('💰 ===== FINISHED LOADING MONTHLY EXPENSES =====');

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
      
      const accountsToSave: any[] = [];
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
            min_payment: account.minimumPayment || null,
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

      // SAFETY CHECK: Only delete if we have data to save, otherwise just skip
      // This prevents accidental data loss when React state is empty
      if (accountsToSave.length > 0) {
        const { error: deleteError } = await supabase
          .from('user_accounts')
          .delete()
          .eq('user_id', user.id)
          .is('snapshot_id', null);

        if (deleteError) {
          console.error('Error deleting existing accounts:', deleteError);
          throw deleteError;
        }

        const { error: accountsError } = await supabase
          .from('user_accounts')
          .insert(accountsToSave);

        if (accountsError) {
          console.error('Error inserting accounts:', accountsError);
          throw accountsError;
        }
      } else {
        console.log('No accounts in state to save - skipping to prevent data loss');
      }

      // Save monthly expenses - skip if updateMonthlyExpenses was just called
      // (to avoid race conditions, we'll let updateMonthlyExpenses handle it)
      // But we'll still save it here as a backup if it hasn't been saved recently
      console.log('💰 saveData: Monthly expenses value is:', monthlyExpenses);
      
      // Check if monthly expenses already exist in DB
      const { data: existingExpense } = await supabase
        .from('monthly_expenses')
        .select('amount')
        .eq('user_id', user.id)
        .is('snapshot_id', null)
        .maybeSingle();
      
      const dbAmount = existingExpense ? Number(existingExpense.amount) : 0;
      console.log('💰 saveData: Current DB value:', dbAmount, 'State value:', monthlyExpenses);
      
      // Only update if the state value is different from DB value
      if (dbAmount !== monthlyExpenses) {
        console.log('💰 saveData: Values differ, updating...');
        
        const { error: deleteExpensesError } = await supabase
          .from('monthly_expenses')
          .delete()
          .eq('user_id', user.id)
          .is('snapshot_id', null);

        if (deleteExpensesError) {
          console.error('❌ Error deleting existing expenses:', deleteExpensesError);
          throw deleteExpensesError;
        }

        if (monthlyExpenses > 0) {
          const { error: expensesError, data: insertedData } = await supabase
            .from('monthly_expenses')
            .insert({
              user_id: user.id,
              amount: monthlyExpenses,
              name: 'Monthly Expenses',
              snapshot_id: null,
            } as any)
            .select();

          if (expensesError) {
            console.error('❌ Error inserting expenses:', expensesError);
            throw expensesError;
          }
          console.log('✅ saveData: Monthly expenses saved:', monthlyExpenses, insertedData);
        } else {
          console.log('⚠️ saveData: Monthly expenses is 0, not inserting');
        }
      } else {
        console.log('💰 saveData: Values match, skipping update');
      }

      console.log('Data saved successfully');
      toast.success('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Failed to save data');
    }
  };

  const createSnapshot = async (name: string, creditScoreCallback?: (snapshotId: string) => Promise<void>) => {
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
            min_payment: account.minimumPayment || null,
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
          snapshot_id: snapshot.id,
          name: 'Monthly Expenses'
        } as any);

      if (expensesError) throw expensesError;

      // Save credit score snapshot via callback if provided
      if (creditScoreCallback && snapshot?.id) {
        await creditScoreCallback(snapshot.id);
      }

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
    console.log('💰💰💰 ===== updateMonthlyExpenses CALLED =====', amount);
    
    if (!user) {
      console.error('❌ No user found!');
      return;
    }

    try {
      console.log('💰 Step 1: Deleting existing monthly expenses...');
      // Always clear the current (non-snapshot) monthly expenses first
      const { error: deleteError, data: deleteData } = await supabase
        .from('monthly_expenses')
        .delete()
        .eq('user_id', user.id)
        .is('snapshot_id', null)
        .select();

      if (deleteError) {
        console.error('❌ Error deleting existing monthly expenses:', deleteError);
        throw deleteError;
      }
      console.log('✅ Deleted existing expenses. Rows deleted:', deleteData?.length || 0);

      // Only insert a new row if the amount is greater than zero.
      // This matches the behavior of saveData and avoids creating
      // \"empty\" expenses rows when the user clears the value.
      if (amount > 0) {
        console.log('💰 Step 2: Inserting new monthly expenses:', amount);
        const { error: insertError, data: insertData } = await supabase
          .from('monthly_expenses')
          .insert({
            user_id: user.id,
            amount,
            name: 'Monthly Expenses',
            snapshot_id: null, // Explicitly set to null for current expenses
          } as any)
          .select();

        if (insertError) {
          console.error('❌ Error inserting monthly expenses:', insertError);
          throw insertError;
        }
        console.log('✅✅✅ ===== MONTHLY EXPENSES SAVED TO DB =====', amount);
        console.log('Inserted row:', insertData);
      } else {
        console.log('⚠️ Monthly expenses set to 0, not saving (as per user preference)');
      }

      setMonthlyExpenses(amount);
      toast.success('Monthly expenses updated!');
      console.log('💰💰💰 ===== updateMonthlyExpenses COMPLETE =====');
    } catch (e) {
      toast.error('Failed to update expenses');
      console.error('❌❌❌ updateMonthlyExpenses ERROR:', e);
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
