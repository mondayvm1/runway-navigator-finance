
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface CategorySettings {
  hiddenCategories: Record<string, boolean>;
}

export const useCategorySettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CategorySettings>({ hiddenCategories: {} });
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
        .from('category_settings')
        .select('hidden_categories')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading category settings:', error);
        return;
      }

      if (data) {
        setSettings({ hiddenCategories: data.hidden_categories || {} });
      }
    } catch (error) {
      console.error('Error loading category settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryVisibility = async (category: string, isHidden: boolean) => {
    if (!user) return;

    const newSettings = {
      ...settings,
      hiddenCategories: {
        ...settings.hiddenCategories,
        [category]: isHidden
      }
    };

    setSettings(newSettings);

    try {
      const { error } = await supabase
        .from('category_settings')
        .upsert({
          user_id: user.id,
          hidden_categories: newSettings.hiddenCategories,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating category settings:', error);
      // Revert on error
      setSettings(settings);
    }
  };

  const isCategoryHidden = (category: string) => {
    return settings.hiddenCategories[category] || false;
  };

  return {
    settings,
    loading,
    updateCategoryVisibility,
    isCategoryHidden
  };
};
