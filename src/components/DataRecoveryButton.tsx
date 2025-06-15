
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DataRecoveryButtonProps {
  onRefreshData: () => Promise<void>;
  loading: boolean;
  dataFound: boolean;
  onShowSnapshots?: () => void;
}

const DataRecoveryButton = ({ onRefreshData, loading, dataFound, onShowSnapshots }: DataRecoveryButtonProps) => {
  const { user } = useAuth();
  const [snapshotCount, setSnapshotCount] = useState<number>(0);
  const [checkingSnapshots, setCheckingSnapshots] = useState(false);

  const checkForSnapshots = async () => {
    if (!user) return;

    setCheckingSnapshots(true);
    try {
      const { data: snapshots, error } = await supabase
        .from('financial_snapshots')
        .select('id')
        .eq('user_id', user.id);

      if (error) throw error;

      const count = snapshots?.length || 0;
      setSnapshotCount(count);

      if (count > 0) {
        toast.success(`Found ${count} snapshot${count > 1 ? 's' : ''} available for recovery!`);
        if (onShowSnapshots) {
          onShowSnapshots();
        }
      } else {
        toast.info('No snapshots found for recovery.');
      }
    } catch (error) {
      console.error('Error checking snapshots:', error);
      toast.error('Failed to check for snapshots');
    } finally {
      setCheckingSnapshots(false);
    }
  };

  if (!dataFound) {
    return (
      <div className="flex gap-2">
        <Button 
          onClick={onRefreshData}
          variant="outline"
          size="sm"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh Data'}
        </Button>
        
        <Button 
          onClick={checkForSnapshots}
          variant="outline"
          size="sm"
          disabled={checkingSnapshots}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <History className={`h-4 w-4 ${checkingSnapshots ? 'animate-spin' : ''}`} />
          {checkingSnapshots ? 'Checking...' : 'Check Snapshots'}
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={onRefreshData}
      variant="outline"
      size="sm"
      disabled={loading}
      className="flex items-center gap-2"
    >
      <Database className="h-4 w-4" />
      {loading ? 'Refreshing...' : 'Refresh'}
    </Button>
  );
};

export default DataRecoveryButton;
