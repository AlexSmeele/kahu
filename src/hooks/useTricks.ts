import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
    if (!dogId || !user) return;

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

  const updateTrickStatus = async (dogTrickId: string, status: DogTrick['status']) => {
    try {
      const updates: any = { status };
      if (status === 'mastered') {
        updates.mastered_at = new Date().toISOString();
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
          title: '🎉 Trick mastered!',
          description: `${updatedDogTrick.trick.name} has been mastered!`,
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
    updateTrickStatus,
    refetch: () => {
      fetchTricks();
      if (dogId) fetchDogTricks();
    },
  };
}