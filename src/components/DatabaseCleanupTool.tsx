import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DuplicateGroup {
  name: string;
  category: string;
  count: number;
  balance: number;
}

const DatabaseCleanupTool = () => {
  const { user } = useAuth();
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const scanForDuplicates = async () => {
    if (!user) return;
    
    setScanning(true);
    try {
      const { data: accounts, error } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('user_id', user.id)
        .is('snapshot_id', null);

      if (error) throw error;

      // Group by category + name + balance to find duplicates
      const grouped = new Map<string, any[]>();
      accounts?.forEach((account: any) => {
        const category = account.category || account.type || 'unknown';
        const key = `${category}|${account.name}|${account.balance}`;
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)?.push(account);
      });

      // Find groups with more than 1 entry
      const dupes: DuplicateGroup[] = [];
      grouped.forEach((accounts, key) => {
        if (accounts.length > 1) {
          const [category, name, balance] = key.split('|');
          dupes.push({
            category,
            name,
            count: accounts.length,
            balance: parseFloat(balance),
          });
        }
      });

      setDuplicates(dupes);
      toast.info(`Found ${dupes.length} duplicate groups`);
    } catch (error) {
      console.error('Error scanning for duplicates:', error);
      toast.error('Failed to scan for duplicates');
    } finally {
      setScanning(false);
    }
  };

  const removeDuplicates = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get all accounts
      const { data: accounts, error: fetchError } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('user_id', user.id)
        .is('snapshot_id', null);

      if (fetchError) throw fetchError;

      // Group by category + name + balance + all fields to find exact duplicates
      const grouped = new Map<string, any[]>();
      accounts?.forEach((account: any) => {
        const category = account.category || account.type || 'unknown';
        const key = `${category}|${account.name}|${account.balance}|${account.interest_rate}|${account.credit_limit}|${account.due_date}|${account.min_payment}`;
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)?.push(account);
      });

      let deletedCount = 0;
      const deletePromises = [];
      
      // For each group, keep the most recent one and delete the rest
      for (const [key, group] of grouped.entries()) {
        if (group.length > 1) {
          // Sort by created_at to keep the most recent
          const sorted = group.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          // Keep the first (most recent), delete the rest
          const toDelete = sorted.slice(1).map(acc => acc.id);
          
          // Batch delete
          deletePromises.push(
            supabase
              .from('user_accounts')
              .delete()
              .in('id', toDelete)
              .then(({ error }) => {
                if (error) {
                  console.error(`Error deleting duplicates for ${key}:`, error);
                  throw error;
                } else {
                  deletedCount += toDelete.length;
                }
              })
          );
        }
      }

      // Wait for all deletes to complete
      await Promise.all(deletePromises);

      toast.success(`Cleaned up ${deletedCount} duplicate entries!`);
      setDuplicates([]);
      
      // Refresh the page to show clean data
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Error removing duplicates:', error);
      toast.error('Failed to remove duplicates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-900 mb-2">Database Cleanup Tool</h3>
            <p className="text-sm text-red-700 mb-4">
              Scan for and remove duplicate entries caused by the deletion glitch.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={scanForDuplicates}
            disabled={scanning}
            variant="outline"
            className="border-orange-300"
          >
            {scanning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Scan for Duplicates
              </>
            )}
          </Button>

          {duplicates.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove All Duplicates
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Duplicate Entries?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will keep one copy of each unique account and delete all duplicates.
                    This action cannot be undone. The page will reload after cleanup.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={removeDuplicates} disabled={loading}>
                    {loading ? 'Cleaning...' : 'Yes, Clean Up'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {duplicates.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-sm font-semibold text-red-900">
              Found {duplicates.length} groups with duplicates:
            </p>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {duplicates.map((dup, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border border-red-200">
                  <div>
                    <p className="font-medium text-slate-800">{dup.name}</p>
                    <p className="text-xs text-slate-600">Category: {dup.category}</p>
                  </div>
                  <Badge variant="destructive">
                    {dup.count} duplicates
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DatabaseCleanupTool;
