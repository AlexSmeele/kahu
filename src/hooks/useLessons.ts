import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  lesson_type: string;
  content: any;
  order_index: number;
  personalization_rules: any;
}

export function useLessons(moduleId: string) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (moduleId) {
      fetchLessons();
    }
  }, [moduleId]);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      setLessons(data || []);
    } catch (error) {
      logger.error('Error fetching lessons', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    lessons,
    loading,
    refetch: fetchLessons,
  };
}
