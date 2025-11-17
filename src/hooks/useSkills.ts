import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isMockDogId } from '@/lib/mockData';

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  short_description?: string;
  long_description?: string;
  brief_instructions?: string[];
  detailed_instructions?: string[];
  general_tips?: string;
  troubleshooting?: string;
  progressions?: string;
  preparation_tips?: string;
  training_insights?: string;
  difficulty_level: number;
  estimated_time_weeks?: number;
  prerequisites: string[];
  achievement_levels?: {
    level1?: string;
    level2?: string;
    level3?: string;
  };
  ideal_stage_weeks?: {
    level1?: number;
    level2?: number;
    level3?: number;
  };
  pass_criteria?: string;
  fail_criteria?: string;
  mastery_criteria?: string;
  priority_order?: number;
  created_at: string;
}

export interface DogSkill {
  id: string;
  dog_id: string;
  skill_id: string;
  status: 'not_started' | 'learning' | 'practicing' | 'mastered';
  started_at?: string;
  mastered_at?: string;
  total_sessions: number;
  proficiency_level?: 'basic' | 'generalized' | 'proofed';
  basic_completed_at?: string | null;
  generalized_completed_at?: string | null;
  proofed_completed_at?: string | null;
  last_practiced_at?: string | null;
  practice_contexts?: string[];
  skill: Skill;
}

export function useSkills(dogId?: string) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [dogSkills, setDogSkills] = useState<DogSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSkills = async () => {
    // Return mock data for dev mode
    if (dogId && isMockDogId(dogId)) {
      setSkills([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('priority_order', { ascending: true, nullsFirst: false })
        .order('difficulty_level', { ascending: true });

      if (error) throw error;
      setSkills((data as Skill[]) || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast({
        title: 'Error loading skills',
        description: 'Please try refreshing the page',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDogSkills = async () => {
    if (!dogId || !user) { setLoading(false); return; }

    // Return mock data for dev mode
    if (isMockDogId(dogId)) {
      setDogSkills([]);
      setLoading(false);
      return;
    }

    try {
      // First, get dog skills without the join to avoid relation issues
      const { data: dogSkillsData, error: dogSkillsError } = await supabase
        .from('dog_skills')
        .select('*')
        .eq('dog_id', dogId)
        .order('created_at', { ascending: false });

      if (dogSkillsError) throw dogSkillsError;

      // Then get skills separately and combine them
      const { data: skillsData, error: skillsError } = await supabase
        .from('skills')
        .select('*');

      if (skillsError) throw skillsError;

      // Create a map of skills for quick lookup
      const skillsMap = new Map(skillsData?.map(skill => [skill.id, skill]) || []);

      // Combine the data
      const combinedData = dogSkillsData?.map(dogSkill => ({
        ...dogSkill,
        proficiency_level: dogSkill.proficiency_level || 'basic',
        practice_contexts: Array.isArray(dogSkill.practice_contexts) ? dogSkill.practice_contexts : [],
        basic_completed_at: dogSkill.basic_completed_at || null,
        generalized_completed_at: dogSkill.generalized_completed_at || null,
        proofed_completed_at: dogSkill.proofed_completed_at || null,
        last_practiced_at: dogSkill.last_practiced_at || dogSkill.started_at || null,
        skill: skillsMap.get(dogSkill.skill_id)
      })).filter(ds => ds.skill) || [];

      setDogSkills(combinedData as DogSkill[]);
    } catch (error) {
      console.error('Error fetching dog skills:', error);
      toast({
        title: 'Error loading dog skills',
        description: 'Please try refreshing the page',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const startSkill = async (skillId: string) => {
    if (!dogId || !user) return;

    // Mock mode handling
    if (isMockDogId(dogId)) {
      toast({
        title: 'Mock Mode',
        description: 'Skill tracking not available in preview mode',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('dog_skills')
        .insert({
          dog_id: dogId,
          skill_id: skillId,
          status: 'learning',
          started_at: new Date().toISOString(),
          total_sessions: 0,
          proficiency_level: 'basic'
        })
        .select()
        .single();

      if (error) throw error;

      await fetchDogSkills();

      toast({
        title: 'Skill started!',
        description: 'Good luck with your training',
      });

      return data;
    } catch (error) {
      console.error('Error starting skill:', error);
      toast({
        title: 'Error starting skill',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const addPracticeSession = async (dogSkillId: string) => {
    if (!user) return;

    // Mock mode handling
    if (dogId && isMockDogId(dogId)) {
      toast({
        title: 'Mock Mode',
        description: 'Session tracking not available in preview mode',
      });
      return;
    }

    try {
      // Get current dog skill to increment sessions
      const { data: currentSkill, error: fetchError } = await supabase
        .from('dog_skills')
        .select('total_sessions')
        .eq('id', dogSkillId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('dog_skills')
        .update({ 
          total_sessions: (currentSkill?.total_sessions || 0) + 1,
          last_practiced_at: new Date().toISOString()
        })
        .eq('id', dogSkillId);

      if (error) throw error;

      // Also create a training session record
      const dogSkill = dogSkills.find(ds => ds.id === dogSkillId);
      if (dogSkill) {
        await supabase.from('training_sessions').insert({
          dog_id: dogId,
          trick_id: dogSkill.skill_id,
          dog_trick_id: dogSkillId,
          session_date: new Date().toISOString(),
          duration_minutes: 5,
          notes: 'Practice session completed'
        });
      }

      await fetchDogSkills();

      toast({
        title: 'Practice logged!',
        description: 'Keep up the great work',
      });
    } catch (error) {
      console.error('Error logging practice:', error);
      toast({
        title: 'Error logging practice',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const updateSkillStatus = async (dogSkillId: string, status: DogSkill['status']) => {
    if (!user) return;

    // Mock mode handling
    if (dogId && isMockDogId(dogId)) {
      toast({
        title: 'Mock Mode',
        description: 'Status updates not available in preview mode',
      });
      return;
    }

    try {
      const updateData: any = { status };
      
      if (status === 'mastered') {
        updateData.mastered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('dog_skills')
        .update(updateData)
        .eq('id', dogSkillId);

      if (error) throw error;

      await fetchDogSkills();

      toast({
        title: 'Status updated!',
        description: status === 'mastered' ? 'Congratulations!' : 'Status updated successfully',
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error updating status',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const levelUpSkill = async (dogSkillId: string, newLevel: 'generalized' | 'proofed') => {
    if (!user) return;

    // Mock mode handling
    if (dogId && isMockDogId(dogId)) {
      toast({
        title: 'Mock Mode',
        description: 'Level progression not available in preview mode',
      });
      return;
    }

    try {
      const updateData: any = { 
        proficiency_level: newLevel 
      };

      if (newLevel === 'generalized') {
        updateData.generalized_completed_at = new Date().toISOString();
      } else if (newLevel === 'proofed') {
        updateData.proofed_completed_at = new Date().toISOString();
        updateData.status = 'mastered';
        updateData.mastered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('dog_skills')
        .update(updateData)
        .eq('id', dogSkillId);

      if (error) throw error;

      await fetchDogSkills();

      toast({
        title: 'Level up!',
        description: `Skill advanced to ${newLevel} level`,
      });
    } catch (error) {
      console.error('Error leveling up skill:', error);
      toast({
        title: 'Error leveling up',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const recordPracticeSession = async (
    dogSkillId: string,
    sessionData: {
      context: string;
      distraction_level: string;
      success_rate: number;
      duration_minutes?: number;
      notes?: string;
    }
  ) => {
    if (!user || !dogId) return;

    // Mock mode handling
    if (isMockDogId(dogId)) {
      toast({
        title: 'Mock Mode',
        description: 'Session recording not available in preview mode',
      });
      return;
    }

    try {
      const dogSkill = dogSkills.find(ds => ds.id === dogSkillId);
      if (!dogSkill) throw new Error('Dog skill not found');

      // Update dog_skills record
      const currentContexts = dogSkill.practice_contexts || [];
      const updatedContexts = Array.from(new Set([...currentContexts, sessionData.context]));

      const { error: updateError } = await supabase
        .from('dog_skills')
        .update({
          total_sessions: (dogSkill.total_sessions || 0) + 1,
          last_practiced_at: new Date().toISOString(),
          practice_contexts: updatedContexts
        })
        .eq('id', dogSkillId);

      if (updateError) throw updateError;

      // Create training session record
      const { error: sessionError } = await supabase
        .from('training_sessions')
        .insert({
          dog_id: dogId,
          trick_id: dogSkill.skill_id,
          dog_trick_id: dogSkillId,
          session_date: new Date().toISOString(),
          duration_minutes: sessionData.duration_minutes || 5,
          practice_context: sessionData.context,
          distraction_level: sessionData.distraction_level,
          success_rate_percentage: sessionData.success_rate,
          notes: sessionData.notes
        });

      if (sessionError) throw sessionError;

      await fetchDogSkills();

      toast({
        title: 'Practice session recorded!',
        description: 'Your progress has been saved',
      });
    } catch (error) {
      console.error('Error recording practice session:', error);
      toast({
        title: 'Error recording session',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    if (dogId) {
      fetchDogSkills();
    }
  }, [dogId, user]);

  return {
    skills,
    dogSkills,
    loading,
    startSkill,
    addPracticeSession,
    updateSkillStatus,
    levelUpSkill,
    recordPracticeSession,
    refetch: () => {
      fetchSkills();
      if (dogId) fetchDogSkills();
    }
  };
}