import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SkillRequirement {
  id: string;
  trick_id: string;
  proficiency_level: 'basic' | 'generalized' | 'proofed';
  min_sessions_required: number;
  contexts_required: string[];
  description: string;
}

export interface SkillProgressData {
  sessionsCompleted: number;
  contextsCompleted: string[];
  averageSuccessRate: number;
  canLevelUp: boolean;
  nextRequirements: SkillRequirement | null;
  daysSinceLastPractice: number | null;
}

export function useSkillProgression(dogTrickId: string | null) {
  const [requirements, setRequirements] = useState<SkillRequirement[]>([]);
  const [progressData, setProgressData] = useState<SkillProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dogTrickId) {
      setLoading(false);
      return;
    }

    fetchProgressData();
  }, [dogTrickId]);

  const fetchProgressData = async () => {
    if (!dogTrickId) return;

    try {
      setLoading(true);

      // Get dog trick details
      const { data: dogTrick, error: dogTrickError } = await supabase
        .from('dog_tricks')
        .select('trick_id, proficiency_level, last_practiced_at, practice_contexts')
        .eq('id', dogTrickId)
        .single();

      if (dogTrickError) throw dogTrickError;

      // Get requirements for all levels
      const { data: reqs, error: reqsError } = await supabase
        .from('skill_progression_requirements')
        .select('*')
        .eq('trick_id', dogTrick.trick_id)
        .order('proficiency_level');

      if (reqsError) throw reqsError;
      setRequirements((reqs || []) as SkillRequirement[]);

      // Get training sessions for this dog trick  
      const { data: sessions, error: sessionsError } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('dog_trick_id', dogTrickId)
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Calculate progress
      const currentLevel = dogTrick.proficiency_level as 'basic' | 'generalized' | 'proofed';
      const currentRequirement = reqs?.find(r => r.proficiency_level === currentLevel) as SkillRequirement | undefined;
      const nextRequirement = getNextRequirement((reqs || []) as SkillRequirement[], currentLevel);

      const sessionsCompleted = sessions?.length || 0;
      const contextsCompleted = Array.from(new Set(
        sessions?.map(s => s.practice_context).filter(Boolean) || []
      ));
      
      const totalSuccess = sessions?.reduce((sum, s) => sum + (s.success_rate_percentage || 0), 0) || 0;
      const averageSuccessRate = sessionsCompleted > 0 ? totalSuccess / sessionsCompleted : 0;

      // Check if can level up
      const canLevelUp = checkCanLevelUp(
        currentRequirement,
        sessionsCompleted,
        contextsCompleted,
        averageSuccessRate
      );

      // Calculate days since last practice
      let daysSinceLastPractice = null;
      if (dogTrick.last_practiced_at) {
        const lastPractice = new Date(dogTrick.last_practiced_at);
        const now = new Date();
        daysSinceLastPractice = Math.floor((now.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24));
      }

      setProgressData({
        sessionsCompleted,
        contextsCompleted,
        averageSuccessRate,
        canLevelUp,
        nextRequirements: nextRequirement,
        daysSinceLastPractice,
      });
    } catch (error) {
      console.error('Error fetching skill progression:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextRequirement = (
    reqs: SkillRequirement[],
    currentLevel: 'basic' | 'generalized' | 'proofed'
  ): SkillRequirement | null => {
    const levels: ('basic' | 'generalized' | 'proofed')[] = ['basic', 'generalized', 'proofed'];
    const currentIndex = levels.indexOf(currentLevel);
    if (currentIndex === -1 || currentIndex === levels.length - 1) return null;
    
    const nextLevel = levels[currentIndex + 1];
    return reqs.find(r => r.proficiency_level === nextLevel) || null;
  };

  const checkCanLevelUp = (
    requirement: SkillRequirement | undefined,
    sessions: number,
    contexts: string[],
    successRate: number
  ): boolean => {
    if (!requirement) return false;

    const hasEnoughSessions = sessions >= requirement.min_sessions_required;
    const hasRequiredContexts = requirement.contexts_required.every(
      reqContext => contexts.includes(reqContext)
    );
    const hasGoodSuccessRate = successRate >= 70; // Minimum 70% success rate

    return hasEnoughSessions && hasRequiredContexts && hasGoodSuccessRate;
  };

  return {
    requirements,
    progressData,
    loading,
    refetch: fetchProgressData,
  };
}
