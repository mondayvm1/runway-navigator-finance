import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Calendar, TrendingUp, DollarSign, Trash2, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';
import { AccountItem } from '@/hooks/useFinancialData';

interface SnapshotData {
  id: string;
  name: string;
  created_at: string;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  cash: number;
  investments: number;
  credit: number;
  loans: number;
  otherAssets: number;
  monthlyExpenses: number;
}

interface SnapshotViewerProps {
  onClose: () => void;
  onRestoreSnapshot?: (snapshotData: {
    accountData: {
      cash: AccountItem[];
      investments: AccountItem[];
      credit: AccountItem[];
      loans: AccountItem[];
      otherAssets: AccountItem[];
    };
    monthlyExpenses: number;
  }) => void;
}

const SnapshotViewer = ({ onClose, onRestoreSnapshot }: SnapshotViewerProps) => {
  const { user } = useAuth();
  const [snapshots, setSnapshots] = useState<SnapshotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSnapshots();
    }
  }, [user]);

  const loadSnapshots = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get all snapshots for the user
      const { data: snapshotsList, error: snapshotsError } = await supabase
        .from('financial_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (snapshotsError) throw snapshotsError;

      if (!snapshotsList || snapshotsList.length === 0) {
        setSnapshots([]);
        setLoading(false);
        return;
      }

      // Get account data and expenses for each snapshot
      const enrichedSnapshots: SnapshotData[] = [];

      for (const snapshot of snapshotsList) {
        // Get accounts for this snapshot
        const { data: accounts, error: accountsError } = await supabase
          .from('user_accounts')
          .select('*')
          .eq('snapshot_id', snapshot.id);

        if (accountsError) throw accountsError;

        // Get monthly expenses for this snapshot
        const { data: expenses, error: expensesError } = await supabase
          .from('monthly_expenses')
          .select('*')
          .eq('snapshot_id', snapshot.id)
          .single();

        if (expensesError && expensesError.code !== 'PGRST116') throw expensesError;

        // Calculate totals
        let cash = 0;
        let investments = 0;
        let otherAssets = 0;
        let credit = 0;
        let loans = 0;

        accounts?.forEach(account => {
          const balance = Number(account.balance);
          switch (account.category) {
            case 'cash':
              cash += balance;
              break;
            case 'investments':
              investments += balance;
              break;
            case 'otherAssets':
              otherAssets += balance;
              break;
            case 'credit':
              credit += balance;
              break;
            case 'loans':
              loans += balance;
              break;
          }
        });

        const totalAssets = cash + investments + otherAssets;
        const totalLiabilities = credit + loans;
        const netWorth = totalAssets - totalLiabilities;

        enrichedSnapshots.push({
          id: snapshot.id,
          name: snapshot.name,
          created_at: snapshot.created_at,
          netWorth,
          totalAssets,
          totalLiabilities,
          cash,
          investments,
          credit,
          loans,
          otherAssets,
          monthlyExpenses: expenses ? Number(expenses.amount) : 0,
        });
      }

      setSnapshots(enrichedSnapshots);
    } catch (error) {
      console.error('Error loading snapshots:', error);
      toast.error('Failed to load snapshots');
    } finally {
      setLoading(false);
    }
  };

  const restoreFromSnapshot = async (snapshotId: string) => {
    if (!user || !onRestoreSnapshot) return;

    if (!window.confirm('Are you sure you want to restore from this snapshot? This will replace your current financial data.')) {
      return;
    }

    try {
      setRestoring(snapshotId);
      
      // Get accounts for this snapshot
      const { data: accounts, error: accountsError } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('snapshot_id', snapshotId);

      if (accountsError) throw accountsError;

      // Get monthly expenses for this snapshot
      const { data: expenses, error: expensesError } = await supabase
        .from('monthly_expenses')
        .select('*')
        .eq('snapshot_id', snapshotId)
        .single();

      if (expensesError && expensesError.code !== 'PGRST116') throw expensesError;

      // Group accounts by category
      const groupedAccounts = {
        cash: [] as AccountItem[],
        investments: [] as AccountItem[],
        credit: [] as AccountItem[],
        loans: [] as AccountItem[],
        otherAssets: [] as AccountItem[]
      };

      accounts?.forEach(account => {
        const accountItem: AccountItem = {
          id: account.account_id,
          name: account.name,
          balance: Number(account.balance),
          interestRate: 0, // Default, can be enhanced later
          creditLimit: account.credit_limit ? Number(account.credit_limit) : undefined,
          dueDate: account.due_date || undefined,
          minimumPayment: account.minimum_payment ? Number(account.minimum_payment) : undefined
        };

        if (account.category in groupedAccounts) {
          groupedAccounts[account.category as keyof typeof groupedAccounts].push(accountItem);
        }
      });

      // Call the restore callback
      onRestoreSnapshot({
        accountData: groupedAccounts,
        monthlyExpenses: expenses ? Number(expenses.amount) : 0
      });

      toast.success('Financial data restored from snapshot!');
      onClose(); // Close the modal after successful restore
    } catch (error) {
      console.error('Error restoring snapshot:', error);
      toast.error('Failed to restore from snapshot');
    } finally {
      setRestoring(null);
    }
  };

  const deleteSnapshot = async (snapshotId: string) => {
    if (!window.confirm('Are you sure you want to delete this snapshot? This cannot be undone.')) {
      return;
    }

    try {
      // Delete associated accounts and expenses first
      await supabase.from('user_accounts').delete().eq('snapshot_id', snapshotId);
      await supabase.from('monthly_expenses').delete().eq('snapshot_id', snapshotId);
      
      // Delete the snapshot
      const { error } = await supabase
        .from('financial_snapshots')
        .delete()
        .eq('id', snapshotId);

      if (error) throw error;

      toast.success('Snapshot deleted successfully');
      loadSnapshots(); // Reload the list
    } catch (error) {
      console.error('Error deleting snapshot:', error);
      toast.error('Failed to delete snapshot');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-white">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">Financial Snapshots</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(90vh-100px)] p-6">
          {loading ? (
            <div className="text-center py-8">Loading snapshots...</div>
          ) : snapshots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No snapshots found. Create your first snapshot to start tracking your financial progress!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {snapshots.map((snapshot) => (
                <Card key={snapshot.id} className="p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{snapshot.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(snapshot.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={snapshot.netWorth >= 0 ? "default" : "destructive"}
                        className="text-sm"
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {formatCurrency(snapshot.netWorth)}
                      </Badge>
                      {onRestoreSnapshot && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreFromSnapshot(snapshot.id)}
                          disabled={restoring === snapshot.id}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          {restoring === snapshot.id ? 'Restoring...' : 'Restore'}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSnapshot(snapshot.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Cash</div>
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(snapshot.cash)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Investments</div>
                      <div className="text-lg font-semibold text-blue-600">
                        {formatCurrency(snapshot.investments)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Credit</div>
                      <div className="text-lg font-semibold text-red-600">
                        {formatCurrency(snapshot.credit)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Monthly Expenses</div>
                      <div className="text-lg font-semibold text-purple-600">
                        {formatCurrency(snapshot.monthlyExpenses)}
                      </div>
                    </div>
                  </div>
                  
                  {snapshot.otherAssets > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Other Assets</div>
                        <div className="text-lg font-semibold text-purple-600">
                          {formatCurrency(snapshot.otherAssets)}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
};

export default SnapshotViewer;
