import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useCreditScore = () => {
  const { user } = useAuth();
  const [actualScore, setActualScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadCreditScore();
    }
  }, [user]);

  const loadCreditScore = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('credit_scores')
        .select('actual_score')
        .eq('user_id', user.id)
        .is('snapshot_id', null)
        .maybeSingle();

      if (error) {
        console.error('Error loading credit score:', error);
        return;
      }

      if (data) {
        setActualScore(data.actual_score);
      }
    } catch (error) {
      console.error('Error loading credit score:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateActualScore = async (score: number | null) => {
    if (!user) return;

    try {
      // Check if a record exists
      const { data: existing } = await supabase
        .from('credit_scores')
        .select('id')
        .eq('user_id', user.id)
        .is('snapshot_id', null)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('credit_scores')
          .update({ 
            actual_score: score,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('credit_scores')
          .insert({
            user_id: user.id,
            actual_score: score
          });

        if (error) throw error;
      }

      setActualScore(score);
      toast.success('Credit score saved!');
    } catch (error) {
      console.error('Error saving credit score:', error);
      toast.error('Failed to save credit score');
    }
  };

  const saveCreditScoreSnapshot = async (snapshotId: string) => {
    if (!user || actualScore === null) return;

    try {
      const { error } = await supabase
        .from('credit_scores')
        .insert({
          user_id: user.id,
          actual_score: actualScore,
          snapshot_id: snapshotId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving credit score snapshot:', error);
    }
  };

  return {
    actualScore,
    setActualScore: updateActualScore,
    saveCreditScoreSnapshot,
    loading,
    loadCreditScore
  };
};
