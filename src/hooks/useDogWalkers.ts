import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Walker {
  id: string;
  name: string;
  business_name?: string;
  phone?: string;
  email?: string;
  website?: string;
  services?: string[];
  availability?: string;
  service_area?: string;
  latitude?: number;
  longitude?: number;
  google_place_id?: string;
  rating?: number;
  user_ratings_total?: number;
  verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DogWalker {
  id: string;
  dog_id: string;
  walker_id: string;
  is_preferred: boolean;
  relationship_notes?: string;
  preferred_days?: string;
  created_at: string;
  updated_at: string;
  walker: Walker;
}

export function useDogWalkers(dogId?: string) {
  const [dogWalkers, setDogWalkers] = useState<DogWalker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (dogId) {
      fetchDogWalkers(dogId);
    }
  }, [dogId]);

  const fetchDogWalkers = async (id: string) => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('dog_walkers' as any)
        .select(`
          id,
          dog_id,
          walker_id,
          is_preferred,
          relationship_notes,
          preferred_days,
          created_at,
          updated_at,
          walker:walkers (
            id,
            name,
            business_name,
            phone,
            email,
            website,
            services,
            availability,
            service_area,
            rating,
            user_ratings_total,
            verified,
            created_at,
            updated_at
          )
        `)
        .eq('dog_id', id);

      if (fetchError) throw fetchError;

      setDogWalkers(data as any || []);
    } catch (err) {
      console.error('Error fetching dog walkers:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch dog walkers'));
    } finally {
      setIsLoading(false);
    }
  };

  const addWalker = async (
    dogId: string,
    walkerData: Omit<Walker, 'id' | 'created_at' | 'updated_at'>,
    isPreferred: boolean = false,
    relationshipNotes?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // First, insert or get the walker
      const { data: walker, error: walkerError } = await supabase
        .from('walkers' as any)
        .upsert({
          name: walkerData.name,
          business_name: walkerData.business_name,
          phone: walkerData.phone,
          email: walkerData.email,
          website: walkerData.website,
          services: walkerData.services,
          availability: walkerData.availability,
          service_area: walkerData.service_area,
          rating: walkerData.rating,
          user_ratings_total: walkerData.user_ratings_total,
          verified: walkerData.verified || false,
        })
        .select()
        .single();

      if (walkerError) throw walkerError;

      // If setting as preferred, unset other preferred walkers for this dog
      if (isPreferred) {
        await supabase
          .from('dog_walkers' as any)
          .update({ is_preferred: false } as any)
          .eq('dog_id', dogId);
      }

      // Create the relationship
      const { error: relationshipError } = await supabase
        .from('dog_walkers' as any)
        .insert({
          dog_id: dogId,
          walker_id: (walker as any).id,
          is_preferred: isPreferred,
          relationship_notes: relationshipNotes,
        } as any);

      if (relationshipError) throw relationshipError;

      await fetchDogWalkers(dogId);
    } catch (err) {
      console.error('Error adding walker:', err);
      setError(err instanceof Error ? err : new Error('Failed to add walker'));
      throw err;
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);
    setError(null);

    try {
      // If setting as preferred, get the dog_id and unset others
      if (updates.is_preferred) {
        const { data: relationship } = await supabase
          .from('dog_walkers' as any)
          .select('dog_id')
          .eq('id', relationshipId)
          .single();

        if (relationship) {
          await supabase
            .from('dog_walkers' as any)
            .update({ is_preferred: false } as any)
            .eq('dog_id', (relationship as any).dog_id);
        }
      }

      const { error: updateError } = await supabase
        .from('dog_walkers' as any)
        .update(updates as any)
        .eq('id', relationshipId);

      if (updateError) throw updateError;

      // Refresh the list
      const currentWalker = dogWalkers.find(dw => dw.id === relationshipId);
      if (currentWalker) {
        await fetchDogWalkers(currentWalker.dog_id);
      }
    } catch (err) {
      console.error('Error updating walker relationship:', err);
      setError(err instanceof Error ? err : new Error('Failed to update walker relationship'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeWalker = async (relationshipId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const currentWalker = dogWalkers.find(dw => dw.id === relationshipId);
      
      const { error: deleteError } = await supabase
        .from('dog_walkers' as any)
        .delete()
        .eq('id', relationshipId);

      if (deleteError) throw deleteError;

      if (currentWalker) {
        await fetchDogWalkers(currentWalker.dog_id);
      }
    } catch (err) {
      console.error('Error removing walker:', err);
      setError(err instanceof Error ? err : new Error('Failed to remove walker'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const searchWalkers = async (
    query: string,
    latitude?: number,
    longitude?: number
  ): Promise<Walker[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('search-dog-walkers', {
        body: { query, latitude, longitude }
      });

      if (error) throw error;

      return data?.results || [];
    } catch (err) {
      console.error('Error searching dog walkers:', err);
      return [];
    }
  };

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
