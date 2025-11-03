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
  const [stats, setStats] = useState({
    modulesCompleted: 0,
    daysActive: 1,
    quizAverage: 0,
  });

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

      // Calculate stats
      const quizScores = Object.values(progressMap)
        .map(p => p.best_score_pct)
        .filter((score): score is number => score !== null && score !== undefined);
      
      const avgScore = quizScores.length > 0 
        ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
        : 0;

      // Calculate days active (days since first progress)
      const timestamps = data?.map(d => new Date(d.created_at).getTime()) || [];
      const firstActivity = timestamps.length > 0 ? Math.min(...timestamps) : Date.now();
      const daysActive = Math.max(1, Math.ceil((Date.now() - firstActivity) / (1000 * 60 * 60 * 24)));

      setStats({
        modulesCompleted: totalCompleted,
        daysActive,
        quizAverage: avgScore,
      });
      
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

      // Get current progress
      const currentProgress = progress[moduleId] || {
        completed_lessons: [],
        quiz_attempts: 0,
        best_score_pct: null,
        mastered: false,
        completed_at: null,
      };

      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          completed_lessons: updates.completed_lessons || currentProgress.completed_lessons,
          quiz_attempts: updates.quiz_attempts !== undefined ? updates.quiz_attempts : currentProgress.quiz_attempts,
          best_score_pct: updates.best_score_pct !== undefined ? updates.best_score_pct : currentProgress.best_score_pct,
          mastered: updates.mastered !== undefined ? updates.mastered : currentProgress.mastered,
          completed_at: updates.completed_at || currentProgress.completed_at,
        });

      if (error) throw error;

      await fetchProgress();
    } catch (error) {
      logger.error('Error updating progress', error);
    }
  };

  const markLessonComplete = async (moduleId: string, lessonId: string) => {
    const currentProgress = progress[moduleId];
    const completedLessons = currentProgress?.completed_lessons || [];
    
    if (!completedLessons.includes(lessonId)) {
      await updateProgress(moduleId, {
        completed_lessons: [...completedLessons, lessonId],
      });
    }
  };

  return {
    progress,
    overallProgress,
    stats,
    loading,
    updateProgress,
    markLessonComplete,
    refetch: fetchProgress,
  };
}
