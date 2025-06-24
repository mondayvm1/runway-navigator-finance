
import { supabase } from '@/integrations/supabase/client';

export interface CreateSnapshotParams {
  userId: string;
  snapshotName: string;
  accountData: any;
}

export interface SaveDataParams {
  userId: string;
  accountData: any;
}

export interface LoadSnapshotParams {
  userId: string;
  snapshotId: string;
}

export interface DeleteSnapshotParams {
  userId: string;
  snapshotId: string;
}

export const createSnapshot = async ({ userId, snapshotName, accountData }: CreateSnapshotParams): Promise<string> => {
  const { data, error } = await supabase
    .from('financial_snapshots')
    .insert({
      user_id: userId,
      name: snapshotName,
    })
    .select()
    .single();

  if (error) throw error;
  
  // Save the account data separately if needed
  // This is a simplified version - you might want to store the data in a separate table
  
  return data.id;
};

export const saveData = async ({ userId, accountData }: SaveDataParams): Promise<void> => {
  // Implementation for saving current data
  console.log('Saving data for user:', userId, accountData);
  // You can implement actual data saving logic here
};

export const loadSnapshot = async ({ userId, snapshotId }: LoadSnapshotParams): Promise<any> => {
  const { data, error } = await supabase
    .from('financial_snapshots')
    .select('*')
    .eq('id', snapshotId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  
  // Return some default account data structure
  return {
    cash: [],
    investments: [],
    monthlyExpenses: [],
    monthlyIncome: 0,
    creditCardDebt: 0,
  };
};

export const deleteSnapshot = async ({ userId, snapshotId }: DeleteSnapshotParams): Promise<void> => {
  const { error } = await supabase
    .from('financial_snapshots')
    .delete()
    .eq('id', snapshotId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const fetchSnapshots = async (userId: string) => {
  const { data, error } = await supabase
    .from('financial_snapshots')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return data.map(snapshot => ({
    id: snapshot.id,
    snapshotName: snapshot.name,
    createdAt: snapshot.created_at,
  }));
};
