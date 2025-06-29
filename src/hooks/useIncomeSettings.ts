
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useIncomeSettings = () => {
  const { user } = useAuth();
  const [incomeEnabled, setIncomeEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('income_settings')
        .select('income_enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading income settings:', error);
        return;
      }

      if (data) {
        setIncomeEnabled(data.income_enabled);
      }
    } catch (error) {
      console.error('Error loading income settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateIncomeEnabled = async (enabled: boolean) => {
    if (!user) return;

    setIncomeEnabled(enabled);

    try {
      const { error } = await supabase
        .from('income_settings')
        .upsert({
          user_id: user.id,
          income_enabled: enabled,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating income settings:', error);
      // Revert on error
      setIncomeEnabled(!enabled);
    }
  };

  return {
    incomeEnabled,
    loading,
    updateIncomeEnabled
  };
};
