
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { IncomeEvent } from '@/components/IncomeManager';

export const useIncomeEvents = () => {
  const { user } = useAuth();
  const [incomeEvents, setIncomeEvents] = useState<IncomeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadIncomeEvents();
  }, [user]);

  const loadIncomeEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('income_events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;

      const events: IncomeEvent[] = data?.map(event => ({
        id: event.id,
        name: event.name,
        amount: Number(event.amount),
        date: event.date,
        frequency: event.frequency as 'one-time' | 'monthly' | 'yearly',
        endDate: event.end_date || undefined
      })) || [];

      setIncomeEvents(events);
    } catch (error) {
      console.error('Error loading income events:', error);
    } finally {
      setLoading(false);
    }
  };

  const addIncomeEvent = async (event: Omit<IncomeEvent, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('income_events')
        .insert({
          user_id: user.id,
          name: event.name,
          amount: event.amount,
          date: event.date,
          frequency: event.frequency,
          end_date: event.endDate || null
        })
        .select()
        .single();

      if (error) throw error;

      const newEvent: IncomeEvent = {
        id: data.id,
        name: data.name,
        amount: Number(data.amount),
        date: data.date,
        frequency: data.frequency as 'one-time' | 'monthly' | 'yearly',
        endDate: data.end_date || undefined
      };

      setIncomeEvents(prev => [...prev, newEvent].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (error) {
      console.error('Error adding income event:', error);
    }
  };

  const removeIncomeEvent = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('income_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setIncomeEvents(prev => prev.filter(event => event.id !== id));
    } catch (error) {
      console.error('Error removing income event:', error);
    }
  };

  return {
    incomeEvents,
    loading,
    addIncomeEvent,
    removeIncomeEvent,
    reloadEvents: loadIncomeEvents
  };
};
