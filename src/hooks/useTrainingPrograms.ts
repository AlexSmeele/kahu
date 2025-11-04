import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { useAuth } from '@/contexts/AuthContext';

interface TrainingProgram {
  id: string;
  name: string;
  description: string | null;
  age_group: string;
  min_age_weeks: number | null;
  max_age_weeks: number | null;
  duration_weeks: number;
  difficulty_level: string;
  image_url: string | null;
  is_published: boolean;
  order_index: number;
}

interface ProgramWeek {
  id: string;
  program_id: string;
  week_number: number;
  title: string;
  description: string | null;
  focus_areas: string[] | null;
  goals: string[] | null;
  order_index: number;
}

interface ProgramLesson {
  id: string;
  week_id: string;
  title: string;
  category: string;
  lesson_type: string;
  content: any;
  estimated_minutes: number;
  order_index: number;
  prerequisites: string[] | null;
}

interface UserProgress {
  id: string;
  user_id: string;
  dog_id: string | null;
  program_id: string;
  current_week: number;
  started_at: string;
  completed_at: string | null;
  status: string;
}

interface LessonCompletion {
  id: string;
  user_id: string;
  dog_id: string | null;
  lesson_id: string;
  completed_at: string;
  notes: string | null;
  rating: number | null;
}

export function useTrainingPrograms() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('training_programs')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      logger.error('Error fetching training programs', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    programs,
    loading,
    refetch: fetchPrograms,
  };
}

export function useProgramWeeks(programId: string) {
  const [weeks, setWeeks] = useState<ProgramWeek[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (programId) {
      fetchWeeks();
    }
  }, [programId]);

  const fetchWeeks = async () => {
    try {
      const { data, error } = await supabase
        .from('training_program_weeks')
        .select('*')
        .eq('program_id', programId)
        .order('week_number', { ascending: true });

      if (error) throw error;
      setWeeks(data || []);
    } catch (error) {
      logger.error('Error fetching program weeks', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    weeks,
    loading,
    refetch: fetchWeeks,
  };
}

export function useWeekLessons(weekId: string) {
  const [lessons, setLessons] = useState<ProgramLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (weekId) {
      fetchLessons();
    }
  }, [weekId]);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('training_program_lessons')
        .select('*')
        .eq('week_id', weekId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      logger.error('Error fetching week lessons', error);
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

export function useUserProgress(dogId: string | null) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user, dogId]);

  const fetchProgress = async () => {
    try {
      let query = supabase
        .from('user_training_progress')
        .select('*')
        .eq('user_id', user!.id);

      if (dogId) {
        query = query.eq('dog_id', dogId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProgress(data || []);
    } catch (error) {
      logger.error('Error fetching user progress', error);
    } finally {
      setLoading(false);
    }
  };

  const startProgram = async (programId: string, dogId: string | null = null) => {
    try {
      const { data, error } = await supabase
        .from('user_training_progress')
        .insert({
          user_id: user!.id,
          dog_id: dogId,
          program_id: programId,
          current_week: 1,
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) throw error;
      await fetchProgress();
      return data;
    } catch (error) {
      logger.error('Error starting program', error);
      throw error;
    }
  };

  const updateProgress = async (progressId: string, updates: Partial<UserProgress>) => {
    try {
      const { error } = await supabase
        .from('user_training_progress')
        .update(updates)
        .eq('id', progressId);

      if (error) throw error;
      await fetchProgress();
    } catch (error) {
      logger.error('Error updating progress', error);
      throw error;
    }
  };

  return {
    progress,
    loading,
    startProgram,
    updateProgress,
    refetch: fetchProgress,
  };
}

export function useLessonCompletions(dogId: string | null) {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<LessonCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCompletions();
    }
  }, [user, dogId]);

  const fetchCompletions = async () => {
    try {
      let query = supabase
        .from('user_lesson_completions')
        .select('*')
        .eq('user_id', user!.id);

      if (dogId) {
        query = query.eq('dog_id', dogId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCompletions(data || []);
    } catch (error) {
      logger.error('Error fetching lesson completions', error);
    } finally {
      setLoading(false);
    }
  };

  const completeLesson = async (
    lessonId: string, 
    dogId: string | null = null,
    notes: string | null = null,
    rating: number | null = null
  ) => {
    try {
      const { error } = await supabase
        .from('user_lesson_completions')
        .insert({
          user_id: user!.id,
          dog_id: dogId,
          lesson_id: lessonId,
          notes,
          rating
        });

      if (error) throw error;
      await fetchCompletions();
    } catch (error) {
      logger.error('Error completing lesson', error);
      throw error;
    }
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    return completions.some(c => c.lesson_id === lessonId);
  };

  return {
    completions,
    loading,
    completeLesson,
    isLessonCompleted,
    refetch: fetchCompletions,
  };
}
