import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface FoundationModule {
  id: string;
  category: string;
  title: string;
  format: string;
  estimated_minutes: number;
  ideal_stage: string;
  brief_description: string;
  detailed_description: string;
  brief_steps: string[];
  detailed_steps: string[];
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface ModuleCompletion {
  id: string;
  user_id: string;
  module_id: string;
  completed_at: string;
  rating: number | null;
  notes: string | null;
}

interface GroupedModules {
  [category: string]: FoundationModule[];
}

export function useFoundationModules() {
  const [modules, setModules] = useState<FoundationModule[]>([]);
  const [groupedModules, setGroupedModules] = useState<GroupedModules>({});
  const [completions, setCompletions] = useState<ModuleCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchModules();
    fetchCompletions();
  }, []);

  const fetchModules = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('foundation_modules')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (fetchError) throw fetchError;

      const modulesData = (data || []) as FoundationModule[];
      setModules(modulesData);

      // Group modules by category
      const grouped = modulesData.reduce((acc, module) => {
        if (!acc[module.category]) {
          acc[module.category] = [];
        }
        acc[module.category].push(module);
        return acc;
      }, {} as GroupedModules);

      setGroupedModules(grouped);
    } catch (err) {
      logger.error('Error fetching foundation modules', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from('user_module_completions')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;

      setCompletions((data || []) as ModuleCompletion[]);
    } catch (err) {
      logger.error('Error fetching module completions', err);
    }
  };

  const fetchModulesByCategory = (category: string): FoundationModule[] => {
    return groupedModules[category] || [];
  };

  const getModuleById = (moduleId: string): FoundationModule | undefined => {
    return modules.find(m => m.id === moduleId);
  };

  const isModuleCompleted = (moduleId: string): boolean => {
    return completions.some(c => c.module_id === moduleId);
  };

  const getModuleCompletion = (moduleId: string): ModuleCompletion | undefined => {
    return completions.find(c => c.module_id === moduleId);
  };

  const markModuleComplete = async (
    moduleId: string,
    rating?: number,
    notes?: string
  ): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error: insertError } = await supabase
        .from('user_module_completions')
        .insert({
          user_id: user.id,
          module_id: moduleId,
          completed_at: new Date().toISOString(),
          rating: rating || null,
          notes: notes || null,
        });

      if (insertError) throw insertError;

      // Refresh completions
      await fetchCompletions();
    } catch (err) {
      logger.error('Error marking module as complete', err);
      throw err;
    }
  };

  const getCategoryProgress = (category: string): {
    completed: number;
    total: number;
    percentage: number;
  } => {
    const categoryModules = groupedModules[category] || [];
    const completed = categoryModules.filter(m => isModuleCompleted(m.id)).length;
    const total = categoryModules.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  const getOverallProgress = (): {
    completed: number;
    total: number;
    percentage: number;
  } => {
    const total = modules.length;
    const completed = completions.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  return {
    modules,
    groupedModules,
    completions,
    loading,
    error,
    fetchModules,
    fetchModulesByCategory,
    getModuleById,
    isModuleCompleted,
    getModuleCompletion,
    markModuleComplete,
    getCategoryProgress,
    getOverallProgress,
  };
}
