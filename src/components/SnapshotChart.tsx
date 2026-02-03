
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/formatters';
import { TrendingUp, RefreshCw, Trash2, Target, Calendar } from 'lucide-react';
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
  otherAssets: number;
  monthlyExpenses: number;
  runwayMonths: number;
  changeFromPrevious?: {
    netWorth: number;
    totalAssets: number;
    totalLiabilities: number;
  };
}

const SnapshotChart = () => {
  const { user } = useAuth();
  const [snapshotData, setSnapshotData] = useState<SnapshotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState({
    netWorth: true,
    totalAssets: true,
    totalLiabilities: true,
    cash: false,
    investments: false,
  });

  useEffect(() => {
    if (user) {
      loadSnapshotData();
    }
  }, [user]);

  const loadSnapshotData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
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

      const enrichedSnapshots: SnapshotData[] = [];

      for (const snapshot of snapshots) {
        const { data: accounts, error: accountsError } = await supabase
          .from('user_accounts')
          .select('*')
          .eq('snapshot_id', snapshot.id);

        if (accountsError) throw accountsError;

        const { data: expenses, error: expensesError } = await supabase
          .from('monthly_expenses')
          .select('*')
          .eq('snapshot_id', snapshot.id)
          .maybeSingle();

        if (expensesError && expensesError.code !== 'PGRST116') throw expensesError;

        let cash = 0;
        let investments = 0;
        let otherAssets = 0;
        let credit = 0;
        let loans = 0;

        accounts?.forEach((account: any) => {
          const balance = Number(account.balance) || 0;
          const category = account.category || account.type || 'cash';
          switch (category) {
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
              credit += Math.abs(balance); // Make sure credit is positive for liabilities
              break;
            case 'loans':
              loans += Math.abs(balance); // Make sure loans is positive for liabilities
              break;
          }
        });

        const totalAssets = cash + investments + otherAssets;
        const totalLiabilities = credit + loans;
        const netWorth = totalAssets - totalLiabilities;
        const monthlyExpenses = expenses ? Number(expenses.amount) || 0 : 0;
        const runwayMonths = monthlyExpenses > 0 ? Math.floor(cash / monthlyExpenses) : 0;

        enrichedSnapshots.push({
          id: snapshot.id,
          name: (snapshot as any).name || `Snapshot ${new Date(snapshot.created_at).toLocaleDateString()}`,
          created_at: snapshot.created_at,
          netWorth,
          totalAssets,
          totalLiabilities,
          cash,
          investments,
          otherAssets,
          monthlyExpenses,
          runwayMonths,
        });
      }

      // Calculate changes from previous snapshot
      for (let i = 1; i < enrichedSnapshots.length; i++) {
        const current = enrichedSnapshots[i];
        const previous = enrichedSnapshots[i - 1];
        
        current.changeFromPrevious = {
          netWorth: current.netWorth - previous.netWorth,
          totalAssets: current.totalAssets - previous.totalAssets,
          totalLiabilities: current.totalLiabilities - previous.totalLiabilities,
        };
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
      year: '2-digit',
    });
  };

  const getGrowthRate = () => {
    if (snapshotData.length < 2) return null;
    const first = snapshotData[0];
    const last = snapshotData[snapshotData.length - 1];
    const months = (new Date(last.created_at).getTime() - new Date(first.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (months === 0) return null;
    return ((last.netWorth - first.netWorth) / first.netWorth * 100) / months;
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg min-w-[250px]">
          <p className="font-semibold text-gray-900 mb-1">{data.name}</p>
          <p className="text-sm text-gray-600 mb-3">{formatDate(data.created_at)}</p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-medium">{entry.name}:</span>
                </div>
                <span className="text-sm font-semibold" style={{ color: entry.color }}>
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>
          {data.changeFromPrevious && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Change from previous:</p>
              <div className="text-xs space-y-1">
                <div className={`flex justify-between ${data.changeFromPrevious.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span>Net Worth:</span>
                  <span>{data.changeFromPrevious.netWorth >= 0 ? '+' : ''}{formatCurrency(data.changeFromPrevious.netWorth)}</span>
                </div>
              </div>
            </div>
          )}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-600">
              <span>Runway: {data.runwayMonths} months</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const toggleMetric = (metric: keyof typeof selectedMetrics) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  const growthRate = getGrowthRate();

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/50 border border-white/80 p-6 mb-6">
        <div className="text-center text-slate-500">Loading snapshot data...</div>
      </div>
    );
  }

  if (snapshotData.length < 2) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/50 border border-white/80 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Financial Progress</h3>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              disabled={refreshing}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <div className="text-center text-slate-500 py-8">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-lg font-medium text-slate-700 mb-2">Create snapshots to track your progress</p>
          <p className="text-slate-500">Take at least 2 snapshots to see your financial journey over time.</p>
          {snapshotData.length === 1 && (
            <p className="text-sm mt-3 text-blue-600 font-medium">You have 1 snapshot. Create one more to see the chart!</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/50 border border-white/80 p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Financial Progress</h3>
          {growthRate && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              growthRate >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              <Target className="h-3 w-3" />
              {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%/month
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            disabled={refreshing}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={handleClearAllSnapshots}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metric Toggle Buttons */}
      <div className="flex flex-wrap gap-2 mb-5 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
        <span className="text-sm font-medium text-slate-600 mr-2 self-center">Show:</span>
        {Object.entries(selectedMetrics).map(([key, value]) => (
          <Button
            key={key}
            onClick={() => toggleMetric(key as keyof typeof selectedMetrics)}
            variant={value ? "default" : "ghost"}
            size="sm"
            className={`text-xs ${value ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {key === 'netWorth' ? 'Net Worth' : 
             key === 'totalAssets' ? 'Assets' :
             key === 'totalLiabilities' ? 'Liabilities' :
             key === 'cash' ? 'Cash' : 'Investments'}
          </Button>
        ))}
      </div>
      
      <div className="h-96 w-full">
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
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
            
            {selectedMetrics.netWorth && (
              <Line 
                type="monotone" 
                dataKey="netWorth" 
                stroke="#2563eb" 
                strokeWidth={4}
                name="Net Worth"
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, strokeWidth: 2 }}
              />
            )}
            {selectedMetrics.totalAssets && (
              <Line 
                type="monotone" 
                dataKey="totalAssets" 
                stroke="#16a34a" 
                strokeWidth={3}
                name="Total Assets"
                dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            )}
            {selectedMetrics.totalLiabilities && (
              <Line 
                type="monotone" 
                dataKey="totalLiabilities" 
                stroke="#dc2626" 
                strokeWidth={3}
                name="Total Liabilities"
                dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            )}
            {selectedMetrics.cash && (
              <Line 
                type="monotone" 
                dataKey="cash" 
                stroke="#059669" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Cash"
                dot={{ fill: '#059669', strokeWidth: 1, r: 3 }}
              />
            )}
            {selectedMetrics.investments && (
              <Line 
                type="monotone" 
                dataKey="investments" 
                stroke="#7c3aed" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Investments"
                dot={{ fill: '#7c3aed', strokeWidth: 1, r: 3 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
          <div className="font-semibold text-blue-900">Latest Net Worth</div>
          <div className="text-xl font-bold text-blue-700">
            {formatCurrency(snapshotData[snapshotData.length - 1]?.netWorth || 0)}
          </div>
          {snapshotData.length > 1 && (
            <div className={`text-sm ${(snapshotData[snapshotData.length - 1]?.changeFromPrevious?.netWorth || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {(snapshotData[snapshotData.length - 1]?.changeFromPrevious?.netWorth || 0) >= 0 ? '+' : ''}
              {formatCurrency(snapshotData[snapshotData.length - 1]?.changeFromPrevious?.netWorth || 0)} from previous
            </div>
          )}
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 rounded-xl border border-emerald-100">
          <div className="font-semibold text-emerald-900">Total Snapshots</div>
          <div className="text-xl font-bold text-emerald-700">{snapshotData.length}</div>
          <div className="text-sm text-emerald-600">
            Tracking since {formatDate(snapshotData[0]?.created_at || '')}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-xl border border-purple-100">
          <div className="font-semibold text-purple-900">Current Runway</div>
          <div className="text-xl font-bold text-purple-700">
            {snapshotData[snapshotData.length - 1]?.runwayMonths || 0} months
          </div>
          <div className="text-sm text-purple-600">
            Based on current cash & expenses
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-slate-500">
        <p>Track your financial progress across different snapshots. Use metric toggles to focus on specific areas.</p>
      </div>
    </div>
  );
};

export default SnapshotChart;
