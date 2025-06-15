
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/formatters';
import { TrendingUp, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SnapshotData {
  id: string;
  name: string;
  created_at: string;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  cash: number;
  investments: number;
  monthlyExpenses: number;
}

const SnapshotChart = () => {
  const { user } = useAuth();
  const [snapshotData, setSnapshotData] = useState<SnapshotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadSnapshotData();
    }
  }, [user]);

  const loadSnapshotData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get all snapshots for the user
      const { data: snapshots, error: snapshotsError } = await supabase
        .from('financial_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (snapshotsError) throw snapshotsError;

      if (!snapshots || snapshots.length === 0) {
        setSnapshotData([]);
        setLoading(false);
        return;
      }

      // Get account data and expenses for each snapshot
      const enrichedSnapshots: SnapshotData[] = [];

      for (const snapshot of snapshots) {
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
          monthlyExpenses: expenses ? Number(expenses.amount) : 0,
        });
      }

      setSnapshotData(enrichedSnapshots);
    } catch (error) {
      console.error('Error loading snapshot data:', error);
      toast.error('Failed to load snapshot data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSnapshotData();
    setRefreshing(false);
    toast.success('Snapshot data refreshed!');
  };

  const handleClearAllSnapshots = async () => {
    if (!user) return;

    if (!window.confirm('Are you sure you want to delete ALL snapshots? This cannot be undone and will clear the progress chart.')) {
      return;
    }

    try {
      // Delete all snapshot accounts and expenses first
      const { data: snapshots } = await supabase
        .from('financial_snapshots')
        .select('id')
        .eq('user_id', user.id);

      if (snapshots) {
        for (const snapshot of snapshots) {
          await supabase.from('user_accounts').delete().eq('snapshot_id', snapshot.id);
          await supabase.from('monthly_expenses').delete().eq('snapshot_id', snapshot.id);
        }
      }

      // Delete all snapshots
      const { error } = await supabase
        .from('financial_snapshots')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setSnapshotData([]);
      toast.success('All snapshots cleared successfully');
    } catch (error) {
      console.error('Error clearing snapshots:', error);
      toast.error('Failed to clear snapshots');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">{formatDate(data.created_at)}</p>
          <div className="mt-2 space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {formatCurrency(entry.value)}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="p-6 mb-6">
        <div className="text-center text-gray-500">Loading snapshot data...</div>
      </Card>
    );
  }

  if (snapshotData.length < 2) {
    return (
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Financial Progress</h3>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        <div className="text-center text-gray-500 py-8">
          <p>Create at least 2 snapshots to see your financial progress over time.</p>
          {snapshotData.length === 1 && (
            <p className="text-sm mt-2">You have 1 snapshot. Create one more to see the chart!</p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Financial Progress</h3>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleClearAllSnapshots}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={snapshotData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="created_at" 
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={customTooltip} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="netWorth" 
              stroke="#2563eb" 
              strokeWidth={3}
              name="Net Worth"
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="totalAssets" 
              stroke="#16a34a" 
              strokeWidth={2}
              name="Total Assets"
              dot={{ fill: '#16a34a', strokeWidth: 2, r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="totalLiabilities" 
              stroke="#dc2626" 
              strokeWidth={2}
              name="Total Liabilities"
              dot={{ fill: '#dc2626', strokeWidth: 2, r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="cash" 
              stroke="#059669" 
              strokeWidth={1}
              strokeDasharray="5 5"
              name="Cash"
              dot={{ fill: '#059669', strokeWidth: 1, r: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="investments" 
              stroke="#7c3aed" 
              strokeWidth={1}
              strokeDasharray="5 5"
              name="Investments"
              dot={{ fill: '#7c3aed', strokeWidth: 1, r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Track your financial progress across different snapshots. Solid lines show major metrics, dashed lines show account categories.</p>
        <p className="mt-1 text-xs">Use "Refresh" to update the chart or "Clear All" to remove inaccurate historical data.</p>
      </div>
    </Card>
  );
};

export default SnapshotChart;
