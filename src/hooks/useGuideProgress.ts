import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface ModuleProgress {
  completed_lessons: string[];
  quiz_attempts: number;
  best_score_pct: number | null;
  mastered: boolean;
  completed_at: string | null;
}

export function useGuideProgress() {
  const [progress, setProgress] = useState<Record<string, ModuleProgress>>({});
  const [loading, setLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const progressMap: Record<string, ModuleProgress> = {};
      let totalCompleted = 0;
      
      data?.forEach(item => {
        const lessons = Array.isArray(item.completed_lessons) 
          ? (item.completed_lessons as string[])
          : [];
        
        progressMap[item.module_id] = {
          completed_lessons: lessons,
          quiz_attempts: item.quiz_attempts,
          best_score_pct: item.best_score_pct,
          mastered: item.mastered,
          completed_at: item.completed_at,
        };
        if (item.mastered) totalCompleted++;
      });

      setProgress(progressMap);
      
      // Calculate overall progress (assuming 6 modules)
      const totalModules = 6;
      setOverallProgress(Math.round((totalCompleted / totalModules) * 100));
      
    } catch (error) {
      logger.error('Error fetching progress', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (
    moduleId: string, 
    updates: Partial<ModuleProgress>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          ...updates,
        });

      if (error) throw error;

      await fetchProgress();
    } catch (error) {
      logger.error('Error updating progress', error);
    }
  };

  return {
    progress,
    overallProgress,
    loading,
    updateProgress,
    refetch: fetchProgress,
  };
}
