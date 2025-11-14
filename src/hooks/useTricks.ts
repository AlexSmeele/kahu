import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MOCK_DOG_TRICKS, isMockDogId } from '@/lib/mockData';

export interface Trick {
  id: string;
  name: string;
  category: string;
  description: string;
  instructions: string;
  difficulty_level: number;
  estimated_time_weeks?: number;
  prerequisites: string[];
  priority_order?: number;
  created_at: string;
}

export interface DogTrick {
  id: string;
  dog_id: string;
  trick_id: string;
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
  trick: Trick;
}

export function useTricks(dogId?: string) {
  const [tricks, setTricks] = useState<Trick[]>([]);
  const [dogTricks, setDogTricks] = useState<DogTrick[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTricks = async () => {
    // Return mock data for dev mode
    if (dogId && isMockDogId(dogId)) {
      const { MOCK_TRICKS } = await import('@/lib/mockData');
      setTricks(MOCK_TRICKS as Trick[]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tricks')
        .select('*')
        .order('priority_order', { ascending: true, nullsFirst: false })
        .order('difficulty_level', { ascending: true });

      if (error) throw error;
      setTricks((data as Trick[]) || []);
    } catch (error) {
      console.error('Error fetching tricks:', error);
      toast({
        title: 'Error loading tricks',
        description: 'Please try refreshing the page',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDogTricks = async () => {
    if (!dogId || !user) { setLoading(false); return; }

    // Return mock data for dev mode
    if (isMockDogId(dogId)) {
      const mockData = MOCK_DOG_TRICKS.filter(dt => dt.dog_id === dogId);
      setDogTricks(mockData);
      setLoading(false);
      return;
    }

    try {
      // First, get dog tricks without the join to avoid relation issues
      const { data: dogTricksData, error: dogTricksError } = await supabase
        .from('dog_tricks')
        .select('*')
        .eq('dog_id', dogId)
        .order('created_at', { ascending: false });

      if (dogTricksError) throw dogTricksError;

      // Then get tricks separately and combine them
      const { data: tricksData, error: tricksError } = await supabase
        .from('tricks')
        .select('*');

      if (tricksError) throw tricksError;

      // Create a map of tricks for quick lookup
      const tricksMap = new Map(tricksData?.map(trick => [trick.id, trick]) || []);

      // Combine the data
      const combinedData = dogTricksData?.map(dogTrick => ({
        ...dogTrick,
        proficiency_level: dogTrick.proficiency_level || 'basic',
        practice_contexts: Array.isArray(dogTrick.practice_contexts) ? dogTrick.practice_contexts : [],
        basic_completed_at: dogTrick.basic_completed_at || null,
        generalized_completed_at: dogTrick.generalized_completed_at || null,
        proofed_completed_at: dogTrick.proofed_completed_at || null,
        last_practiced_at: dogTrick.last_practiced_at || dogTrick.started_at || null,
        trick: tricksMap.get(dogTrick.trick_id)
      })).filter(dt => dt.trick) || [];

      setDogTricks(combinedData as DogTrick[]);
    } catch (error) {
      console.error('Error fetching dog tricks:', error);
      toast({
        title: 'Error loading progress',
        description: 'Please try refreshing the page',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const startTrick = async (trickId: string) => {
    if (!dogId || !user) return null;

    try {
      const { data, error } = await supabase
        .from('dog_tricks')
        .insert({
          dog_id: dogId,
          trick_id: trickId,
          status: 'learning',
          started_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) throw error;

      // Get the trick details separately
      const { data: trickData, error: trickError } = await supabase
        .from('tricks')
        .select('*')
        .eq('id', trickId)
        .single();

      if (trickError) throw trickError;

      const newDogTrick = {
        ...data,
        trick: trickData
      } as DogTrick;

      setDogTricks(prev => [newDogTrick, ...prev]);

      toast({
        title: 'Great choice!',
        description: `Started learning ${newDogTrick.trick.name}`,
      });

      return newDogTrick;
    } catch (error) {
      console.error('Error starting trick:', error);
      toast({
        title: 'Error starting trick',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  const addPracticeSession = async (dogTrickId: string) => {
    try {
      // First, get the current dog trick
      const { data: currentDogTrick, error: fetchError } = await supabase
        .from('dog_tricks')
        .select('*')
        .eq('id', dogTrickId)
        .single();

      if (fetchError) throw fetchError;

      // Increment the total sessions
      const newTotalSessions = (currentDogTrick.total_sessions || 0) + 1;

      // Update the dog trick with new session count
      const { data, error } = await supabase
        .from('dog_tricks')
        .update({ 
          total_sessions: newTotalSessions,
          status: newTotalSessions >= 10 ? 'practicing' : currentDogTrick.status || 'learning'
        })
        .eq('id', dogTrickId)
        .select('*')
        .single();

      if (error) throw error;

      // Get the trick details separately
      const { data: trickData, error: trickError } = await supabase
        .from('tricks')
        .select('*')
        .eq('id', data.trick_id)
        .single();

      if (trickError) throw trickError;

      const updatedDogTrick = {
        ...data,
        trick: trickData
      } as DogTrick;

      setDogTricks(prev => 
        prev.map(dt => dt.id === dogTrickId ? updatedDogTrick : dt)
      );

      // Create a training session record
      await supabase
        .from('training_sessions')
        .insert({
          dog_id: currentDogTrick.dog_id,
          trick_id: currentDogTrick.trick_id,
          dog_trick_id: dogTrickId,
          duration_minutes: 10, // Default session length
          success_rating: 3, // Neutral rating
          progress_status: data.status,
          notes: `Practice session ${newTotalSessions}`,
        } as any);

      toast({
        title: "Great work!",
        description: `Practice session ${newTotalSessions} completed for ${trickData.name}`,
      });

      return updatedDogTrick;
    } catch (error) {
      console.error('Error adding practice session:', error);
      toast({
        title: 'Error recording session',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateTrickStatus = async (dogTrickId: string, status: DogTrick['status']) => {
    try {
      const updates: any = { status };
      if (status === 'mastered') {
        updates.mastered_at = new Date().toISOString();
      } else if (status === 'learning') {
        // Reset mastered_at when going back to learning
        updates.mastered_at = null;
        updates.total_sessions = 0; // Reset sessions when undoing progress
      }

      const { data, error } = await supabase
        .from('dog_tricks')
        .update(updates)
        .eq('id', dogTrickId)
        .select('*')
        .single();

      if (error) throw error;

      // Get the trick details separately
      const { data: trickData, error: trickError } = await supabase
        .from('tricks')
        .select('*')
        .eq('id', data.trick_id)
        .single();

      if (trickError) throw trickError;

      const updatedDogTrick = {
        ...data,
        trick: trickData
      } as DogTrick;

      setDogTricks(prev => 
        prev.map(dt => dt.id === dogTrickId ? updatedDogTrick : dt)
      );

      if (status === 'mastered') {
        toast({
          title: "Trick mastered!",
          description: `${updatedDogTrick.trick.name} has been mastered!`,
        });
      } else if (status === 'learning') {
        toast({
          title: 'Progress reset',
          description: `${updatedDogTrick.trick.name} training has been reset to start fresh.`,
        });
      }

      return updatedDogTrick;
    } catch (error) {
      console.error('Error updating trick status:', error);
      toast({
        title: 'Error updating progress',
        description: 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  };

  useEffect(() => {
    fetchTricks();
  }, [dogId]);

  useEffect(() => {
    if (dogId) {
      fetchDogTricks();
    }
  }, [dogId, user]);

  const levelUpSkill = async (dogTrickId: string, newLevel: 'generalized' | 'proofed') => {
    if (!user) return;

    const completedAtField = newLevel === 'generalized' ? 'generalized_completed_at' : 'proofed_completed_at';
    
    const { error } = await supabase
      .from('dog_tricks')
      .update({
        proficiency_level: newLevel,
        [completedAtField]: new Date().toISOString(),
      })
      .eq('id', dogTrickId);

    if (error) {
      console.error('Error leveling up skill:', error);
      toast({
        title: 'Error leveling up skill',
        description: 'Please try again',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Skill leveled up!',
      description: `Skill advanced to ${newLevel} level!`,
    });
    if (dogId) fetchDogTricks();
  };

  const recordPracticeSession = async (
    dogTrickId: string,
    context: string,
    distractionLevel: 'none' | 'mild' | 'moderate' | 'high',
    successRate: number,
    notes?: string
  ) => {
    if (!user) return;

    // Insert training session
    const { error: sessionError } = await supabase
      .from('training_sessions')
      .insert({
        dog_trick_id: dogTrickId,
        practice_context: context,
        distraction_level: distractionLevel,
        success_rate_percentage: successRate,
        notes: notes || null,
        created_at: new Date().toISOString(),
      } as any);

    if (sessionError) {
      console.error('Error recording practice session:', sessionError);
      toast({
        title: 'Error recording session',
        description: 'Please try again',
        variant: 'destructive',
      });
      return;
    }

    // Update dog_trick with last practiced and contexts
    const { data: dogTrick } = await supabase
      .from('dog_tricks')
      .select('practice_contexts, total_sessions')
      .eq('id', dogTrickId)
      .single();

    if (dogTrick) {
      const contexts = Array.isArray(dogTrick.practice_contexts) ? dogTrick.practice_contexts : [];
      if (!contexts.includes(context)) {
        contexts.push(context);
      }

      await supabase
        .from('dog_tricks')
        .update({
          last_practiced_at: new Date().toISOString(),
          practice_contexts: contexts,
          total_sessions: (dogTrick.total_sessions || 0) + 1,
        })
        .eq('id', dogTrickId);
    }

    toast({
      title: 'Session recorded!',
      description: 'Practice session tracked successfully',
    });
    if (dogId) fetchDogTricks();
  };

  return {
    tricks,
    dogTricks,
    loading,
    startTrick,
    addPracticeSession,
    updateTrickStatus,
    levelUpSkill,
    recordPracticeSession,
    refetch: () => {
      fetchTricks();
      if (dogId) fetchDogTricks();
    },
  };
}