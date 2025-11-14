import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DogWalker {
  id: string;
  name: string;
  business_name?: string;
  phone?: string;
  email?: string;
  website?: string;
  services?: string[];
  availability?: string;
  service_area?: string;
  rating?: number;
  user_ratings_total?: number;
  verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DogDogWalker {
  id: string;
  dog_id: string;
  walker_id: string;
  is_preferred: boolean;
  relationship_notes?: string;
  preferred_days?: string;
  created_at: string;
  updated_at: string;
  walker: DogWalker;
}

export function useDogWalkers(dogId?: string) {
  const [dogWalkers, setDogWalkers] = useState<DogDogWalker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDogWalkers = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('dog_dog_walkers')
        .select(`
          *,
          walker:dog_walkers(*)
        `)
        .eq('dog_id', id)
        .order('is_preferred', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setDogWalkers(data || []);
    } catch (err) {
      console.error('Error fetching dog walkers:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const addWalker = async (
    dogId: string,
    walkerData: Omit<DogWalker, 'id' | 'created_at' | 'updated_at'>,
    isPreferred: boolean = false,
    relationshipNotes?: string
  ) => {
    try {
      // Insert or get existing walker
      const { data: newWalker, error: insertError } = await supabase
        .from('dog_walkers')
        .insert([walkerData])
        .select()
        .single();

      if (insertError) throw insertError;

      const walkerId = newWalker.id;

      // If setting as preferred, unset other preferred walkers
      if (isPreferred) {
        await supabase
          .from('dog_dog_walkers')
          .update({ is_preferred: false })
          .eq('dog_id', dogId);
      }

      // Create the relationship
      const { error: relationError } = await supabase
        .from('dog_dog_walkers')
        .insert([{
          dog_id: dogId,
          walker_id: walkerId,
          is_preferred: isPreferred,
          relationship_notes: relationshipNotes
        }]);

      if (relationError) throw relationError;

      // Refresh the list
      await fetchDogWalkers(dogId);
    } catch (err) {
      console.error('Error adding walker:', err);
      throw err;
    }
  };

  const updateWalkerRelationship = async (
    relationshipId: string,
    updates: {
      is_preferred?: boolean;
      relationship_notes?: string;
      preferred_days?: string;
    }
  ) => {
    try {
      // If setting as preferred, first get the dog_id to unset others
      if (updates.is_preferred) {
        const { data: currentRelation } = await supabase
          .from('dog_dog_walkers')
          .select('dog_id')
          .eq('id', relationshipId)
          .single();

        if (currentRelation) {
          await supabase
            .from('dog_dog_walkers')
            .update({ is_preferred: false })
            .eq('dog_id', currentRelation.dog_id)
            .neq('id', relationshipId);
        }
      }

      const { error: updateError } = await supabase
        .from('dog_dog_walkers')
        .update(updates)
        .eq('id', relationshipId);

      if (updateError) throw updateError;

      // Refresh the list
      if (dogId) {
        await fetchDogWalkers(dogId);
      }
    } catch (err) {
      console.error('Error updating walker relationship:', err);
      throw err;
    }
  };

  const removeWalker = async (relationshipId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('dog_dog_walkers')
        .delete()
        .eq('id', relationshipId);

      if (deleteError) throw deleteError;

      // Refresh the list
      if (dogId) {
        await fetchDogWalkers(dogId);
      }
    } catch (err) {
      console.error('Error removing walker:', err);
      throw err;
    }
  };

  const searchWalkers = async (
    query: string,
    serviceArea?: string
  ): Promise<DogWalker[]> => {
    try {
      const { data, error: searchError } = await supabase.functions.invoke('search-dog-walkers', {
        body: { query, service_area: serviceArea }
      });

      if (searchError) throw searchError;

      return data.results || [];
    } catch (err) {
      console.error('Error searching dog walkers:', err);
      return [];
    }
  };

  useEffect(() => {
    if (dogId) {
      fetchDogWalkers(dogId);
    }
  }, [dogId]);

  const preferredWalker = dogWalkers.find(dw => dw.is_preferred);

  return {
    dogWalkers,
    preferredWalker,
    isLoading,
    error,
    fetchDogWalkers,
    addWalker,
    updateWalkerRelationship,
    removeWalker,
    searchWalkers,
  };
}
