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
  trick: Trick;
}

export function useTricks(dogId?: string) {
  const [tricks, setTricks] = useState<Trick[]>([]);
  const [dogTricks, setDogTricks] = useState<DogTrick[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTricks = async () => {
    try {
      const { data, error } = await supabase
        .from('tricks')
        .select('*')
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
          duration_minutes: 10, // Default session length
          success_rating: 3, // Neutral rating
          progress_status: data.status,
          notes: `Practice session ${newTotalSessions}`,
        });

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
  }, []);

  useEffect(() => {
    if (dogId) {
      fetchDogTricks();
    }
  }, [dogId, user]);

  return {
    tricks,
    dogTricks,
    loading,
    startTrick,
    addPracticeSession,
    updateTrickStatus,
    refetch: () => {
      fetchTricks();
      if (dogId) fetchDogTricks();
    },
  };
}