import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Groomer {
  id: string;
  name: string;
  business_name?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  services?: string[];
  specialties?: string[];
  latitude?: number;
  longitude?: number;
  google_place_id?: string;
  rating?: number;
  user_ratings_total?: number;
  verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DogGroomer {
  id: string;
  dog_id: string;
  groomer_id: string;
  is_preferred: boolean;
  relationship_notes?: string;
  preferred_groomer_name?: string;
  created_at: string;
  updated_at: string;
  groomer: Groomer;
}

export function useGroomers(dogId?: string) {
  const [dogGroomers, setDogGroomers] = useState<DogGroomer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDogGroomers = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('dog_groomers')
        .select(`
          *,
          groomer:groomers(*)
        `)
        .eq('dog_id', id)
        .order('is_preferred', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setDogGroomers(data || []);
    } catch (err) {
      console.error('Error fetching dog groomers:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const addGroomer = async (
    dogId: string,
    groomerData: Omit<Groomer, 'id' | 'created_at' | 'updated_at'>,
    isPreferred: boolean = false,
    relationshipNotes?: string
  ) => {
    try {
      // Check if groomer already exists by google_place_id or exact name match
      let groomerId: string;
      
      if (groomerData.google_place_id) {
        const { data: existingGroomer } = await supabase
          .from('groomers')
          .select('id')
          .eq('google_place_id', groomerData.google_place_id)
          .single();

        if (existingGroomer) {
          groomerId = existingGroomer.id;
        } else {
          const { data: newGroomer, error: insertError } = await supabase
            .from('groomers')
            .insert([groomerData])
            .select()
            .single();

          if (insertError) throw insertError;
          groomerId = newGroomer.id;
        }
      } else {
        const { data: newGroomer, error: insertError } = await supabase
          .from('groomers')
          .insert([groomerData])
          .select()
          .single();

        if (insertError) throw insertError;
        groomerId = newGroomer.id;
      }

      // If setting as preferred, unset other preferred groomers
      if (isPreferred) {
        await supabase
          .from('dog_groomers')
          .update({ is_preferred: false })
          .eq('dog_id', dogId);
      }

      // Create the relationship
      const { error: relationError } = await supabase
        .from('dog_groomers')
        .insert([{
          dog_id: dogId,
          groomer_id: groomerId,
          is_preferred: isPreferred,
          relationship_notes: relationshipNotes
        }]);

      if (relationError) throw relationError;

      // Refresh the list
      await fetchDogGroomers(dogId);
    } catch (err) {
      console.error('Error adding groomer:', err);
      throw err;
    }
  };

  const updateGroomerRelationship = async (
    relationshipId: string,
    updates: {
      is_preferred?: boolean;
      relationship_notes?: string;
      preferred_groomer_name?: string;
    }
  ) => {
    try {
      // If setting as preferred, first get the dog_id to unset others
      if (updates.is_preferred) {
        const { data: currentRelation } = await supabase
          .from('dog_groomers')
          .select('dog_id')
          .eq('id', relationshipId)
          .single();

        if (currentRelation) {
          await supabase
            .from('dog_groomers')
            .update({ is_preferred: false })
            .eq('dog_id', currentRelation.dog_id)
            .neq('id', relationshipId);
        }
      }

      const { error: updateError } = await supabase
        .from('dog_groomers')
        .update(updates)
        .eq('id', relationshipId);

      if (updateError) throw updateError;

      // Refresh the list
      if (dogId) {
        await fetchDogGroomers(dogId);
      }
    } catch (err) {
      console.error('Error updating groomer relationship:', err);
      throw err;
    }
  };

  const removeGroomer = async (relationshipId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('dog_groomers')
        .delete()
        .eq('id', relationshipId);

      if (deleteError) throw deleteError;

      // Refresh the list
      if (dogId) {
        await fetchDogGroomers(dogId);
      }
    } catch (err) {
      console.error('Error removing groomer:', err);
      throw err;
    }
  };

  const searchGroomers = async (
    query: string,
    latitude?: number,
    longitude?: number
  ): Promise<Groomer[]> => {
    try {
      const { data, error: searchError } = await supabase.functions.invoke('search-groomers', {
        body: { query, latitude, longitude }
      });

      if (searchError) throw searchError;

      return data.results || [];
    } catch (err) {
      console.error('Error searching groomers:', err);
      return [];
    }
  };

  useEffect(() => {
    if (dogId) {
      fetchDogGroomers(dogId);
    }
  }, [dogId]);

  const preferredGroomer = dogGroomers.find(dg => dg.is_preferred);

  return {
    dogGroomers,
    preferredGroomer,
    isLoading,
    error,
    fetchDogGroomers,
    addGroomer,
    updateGroomerRelationship,
    removeGroomer,
    searchGroomers,
  };
}
