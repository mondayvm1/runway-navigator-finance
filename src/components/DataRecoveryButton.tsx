
import { Button } from '@/components/ui/button';
import { RefreshCw, Database } from 'lucide-react';
import { toast } from 'sonner';

interface DataRecoveryButtonProps {
  onRefreshData: () => Promise<void>;
  loading: boolean;
  dataFound: boolean;
}

const DataRecoveryButton = ({ onRefreshData, loading, dataFound }: DataRecoveryButtonProps) => {
  const handleRefresh = async () => {
    toast.info('Attempting to recover your financial data...');
    await onRefreshData();
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        onClick={handleRefresh} 
        variant="outline" 
        size="sm"
        disabled={loading}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Loading...' : 'Refresh Data'}
      </Button>
      
      {!dataFound && (
        <div className="flex items-center gap-1 text-sm text-amber-600">
          <Database className="h-4 w-4" />
          <span>No saved data found</span>
        </div>
      )}
      
      {dataFound && (
        <div className="flex items-center gap-1 text-sm text-green-600">
          <Database className="h-4 w-4" />
          <span>Data loaded successfully</span>
        </div>
      )}
    </div>
  );
};

export default DataRecoveryButton;
