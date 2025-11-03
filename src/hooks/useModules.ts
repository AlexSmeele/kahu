import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface Module {
  id: string;
  title: string;
  description: string | null;
  estimated_minutes: number;
  order_index: number;
  tags: any;
}

export function useModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from('course_modules')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (error) throw error;

      setModules(data || []);
    } catch (error) {
      logger.error('Error fetching modules', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    modules,
    loading,
    refetch: fetchModules,
  };
}
