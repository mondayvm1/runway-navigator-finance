import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type CreditSource = 'credit_karma' | 'credit_sesame';

export interface CreditReading {
  source: CreditSource;
  score: number | null;
  bureau: string;
  checkedAt: string;
}

const DEFAULTS: Record<CreditSource, CreditReading> = {
  credit_karma: { source: 'credit_karma', score: null, bureau: 'TransUnion / Equifax', checkedAt: '' },
  credit_sesame: { source: 'credit_sesame', score: null, bureau: 'TransUnion', checkedAt: '' },
};

export const useCreditMonitoring = () => {
  const { user } = useAuth();
  const [readings, setReadings] = useState(DEFAULTS);

  const storageKey = user ? `pathline_credit_sources_${user.id}` : '';

  useEffect(() => {
    if (!user) return;

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setReadings({ ...DEFAULTS, ...JSON.parse(saved) });
      } catch {
        // Ignore malformed local fallback data.
      }
    }

    supabase
      .from('credit_monitoring_sources')
      .select('source, score, bureau, checked_at')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (error || !data) return;
        const next = { ...DEFAULTS };
        data.forEach((row) => {
          const source = row.source as CreditSource;
          if (source in next) {
            next[source] = {
              source,
              score: row.score,
              bureau: row.bureau || DEFAULTS[source].bureau,
              checkedAt: row.checked_at,
            };
          }
        });
        setReadings(next);
        localStorage.setItem(storageKey, JSON.stringify(next));
      });
  }, [storageKey, user]);

  const saveReading = useCallback(async (source: CreditSource, score: number | null) => {
    if (!user) return;

    const nextReading: CreditReading = {
      ...readings[source],
      score,
      checkedAt: new Date().toISOString(),
    };
    const next = { ...readings, [source]: nextReading };
    setReadings(next);
    localStorage.setItem(storageKey, JSON.stringify(next));

    await supabase.from('credit_monitoring_sources').upsert({
      user_id: user.id,
      source,
      score,
      bureau: nextReading.bureau,
      checked_at: nextReading.checkedAt,
      updated_at: nextReading.checkedAt,
    }, { onConflict: 'user_id,source' });
  }, [readings, storageKey, user]);

  return { readings, saveReading };
};

